import pytest
from unittest.mock import patch

def test_list_purchases(client, user_auth_header):
    res = client.get("/api/purchases/", headers=user_auth_header)
    assert res.status_code in (200, 404)

def test_checkout(client, user_auth_header, create_test_kit_and_inventory):
    kit, inventory = create_test_kit_and_inventory

    # Add item to cart
    res = client.post("/api/cart", json={"kit_id": kit.id, "quantity": 1}, headers=user_auth_header)
    assert res.status_code == 201

    # Mock Stripe calls
    with patch("app.routes.purchase.stripe.PaymentIntent.create") as mock_create_intent, \
         patch("app.routes.purchase.stripe.PaymentIntent.confirm") as mock_confirm_intent:

        mock_create_intent.return_value = {"id": "pi_test_456", "status": "requires_confirmation"}
        mock_confirm_intent.return_value = {"status": "succeeded"}

        res = client.post("/api/purchases", json={
            "kit_id": kit.id,
            "quantity": 1,
            "inventory_id": inventory.id,
            "payment_method_id": "pm_test_fake_456"
        }, headers=user_auth_header)

        assert res.status_code == 201
        data = res.get_json()
        assert "inventory" in data
