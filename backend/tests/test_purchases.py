import pytest
from unittest.mock import patch, Mock

def test_list_purchases(client, user_auth_header):
    res = client.get("/api/purchases/", headers=user_auth_header)
    assert res.status_code in (200, 404)

def test_checkout(client, user_auth_header, create_test_kit_and_inventory):
    kit, inventory = create_test_kit_and_inventory

    # Add item to cart
    res = client.post("/api/cart", json={"kit_id": kit.id, "quantity": 1}, headers=user_auth_header)
    assert res.status_code == 201

    # Setup proper Mock for Stripe
    mock_intent = Mock()
    mock_intent.id = "pi_test_456"
    mock_intent.status = "succeeded"

    with patch("app.routes.purchase_routes.stripe.PaymentIntent.create", return_value=mock_intent), \
         patch("app.routes.purchase_routes.stripe.PaymentIntent.confirm", return_value=mock_intent):

        res = client.post("/api/purchases", json={
            "items": [
                {
                    "kit_id": kit.id,
                    "quantity": 1,
                    "inventory_id": inventory.id,
                    "kit": {
                        "id": kit.id,
                        "name": kit.name,
                        "price": kit.price
                    },
                    "inventory": {
                        "id": inventory.id,
                        "location_name": inventory.location_name
                    }
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
                    "country": "US"
                }
            }
        }, headers=user_auth_header)


        assert res.status_code == 201, res.get_data(as_text=True)
        data = res.get_json()
        assert isinstance(data, list)
        assert "inventory" in data[0]
