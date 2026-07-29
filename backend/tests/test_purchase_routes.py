from unittest.mock import Mock, patch


def test_purchase_routes_basic(client):
    response = client.get("/api/")
    assert response.status_code in (200, 401, 404)


def test_create_purchase(
    admin_logged_in_client,
    create_test_kit_and_inventory,
):
    kit, inventory = create_test_kit_and_inventory

    # The purchase route directly creates redis.Redis(...) and calls delete().
    # Mock it so this unit test does not require a local Redis server.
    with patch("app.routes.purchase_routes.redis.Redis") as mock_redis_class:
        mock_redis_client = Mock()
        mock_redis_class.return_value = mock_redis_client

        response = admin_logged_in_client.post(
            "/api/purchases",
            json={
                "items": [
                    {
                        "kit_id": kit.id,
                        "quantity": 2,
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
                    "payment_method_id": "pm_mock_123",
                    "email": "test@example.com",
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

    mock_redis_class.assert_called_once_with(
        host="localhost",
        port=6379,
        db=0,
    )
    mock_redis_client.delete.assert_called_once()