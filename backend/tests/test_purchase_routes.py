import pytest
from flask import url_for
from app import create_app, db
from unittest.mock import patch

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def test_purchase_routes_basic(client):
    response = client.get('/api/')
    assert response.status_code in [200, 401, 404]

def test_create_purchase(admin_logged_in_client, admin_auth_header, create_test_kit_and_inventory):
    kit, inventory = create_test_kit_and_inventory

    with patch("app.routes.purchase_routes.stripe.PaymentIntent.create") as mock_create_intent, \
         patch("app.routes.purchase_routes.stripe.PaymentIntent.confirm") as mock_confirm_intent:

        mock_create_intent.return_value = {"id": "pi_test_123", "status": "requires_confirmation"}
        mock_confirm_intent.return_value = {"status": "succeeded"}

        response = admin_logged_in_client.post("/api/purchases", json={
            "kit_id": kit.id,
            "quantity": 2,
            "inventory_id": inventory.id,
            "payment_method_id": "pm_mock_123"
        }, headers=admin_auth_header)

        assert response.status_code == 201
        data = response.get_json()
        assert "inventory" in data
