from unittest.mock import Mock, patch


def test_list_purchases(client, user_auth_header):
    # Referencing user_auth_header runs the login fixture and leaves the
    # authenticated session cookie on this shared client.
    response = client.get("/api/purchases/")

    assert response.status_code in (200, 404), response.get_data(as_text=True)


def test_checkout(
    client,
    user_auth_header,
    create_test_kit_and_inventory,
):
    kit, inventory = create_test_kit_and_inventory

    # Add the item to the authenticated user's cart.
    response = client.post(
        "/api/cart",
        json={
            "kit_id": kit.id,
            "quantity": 1,
        },
    )

    assert response.status_code == 201, response.get_data(as_text=True)

    mock_intent = Mock()
    mock_intent.id = "pi_test_456"
    mock_intent.status = "succeeded"

    mock_redis_client = Mock()

    with (
        patch(
            "app.routes.purchase_routes.stripe.PaymentIntent.create",
            return_value=mock_intent,
        ) as mock_payment_create,
        patch(
            "app.routes.purchase_routes.redis.Redis",
            return_value=mock_redis_client,
        ) as mock_redis_class,
    ):
        response = client.post(
            "/api/purchases",
            json={
                "items": [
                    {
                        "kit_id": kit.id,
                        "quantity": 1,
                        "inventory_id": inventory.id,
                        "kit": {
                            "id": kit.id,
                            "name": kit.name,
                            "price": kit.price,
                        },
                        "inventory": {
                            "id": inventory.id,
                            "location_name": inventory.location_name,
                        },
                    }
                ],
                "billing_details": {
                    "payment_method_id": "pm_test_fake_456",
                    "email": "testuser@example.com",
                    "name": "Test User",
                    "address": {
                        "line1": "123 Main St",
                        "city": "Testville",
                        "state": "CA",
                        "postal_code": "12345",
                        "country": "US",
                    },
                },
            },
        )

    assert response.status_code == 201, response.get_data(as_text=True)

    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert "inventory" in data[0]

    # A normal user purchase should execute the Stripe payment.
    mock_payment_create.assert_called_once()

    # The route creates this Redis client and clears the pending inventory key.
    mock_redis_class.assert_called_once_with(
        host="localhost",
        port=6379,
        db=0,
    )
    mock_redis_client.delete.assert_called_once()