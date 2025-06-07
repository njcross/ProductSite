import pytest
from flask import url_for
from app import create_app, db
from unittest.mock import patch, Mock

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

    mock_intent = Mock()
    mock_intent.id = "pi_test_123"
    mock_intent.status = "succeeded"

    with patch("app.routes.purchase_routes.stripe.PaymentIntent.create", return_value=mock_intent), \
         patch("app.routes.purchase_routes.stripe.PaymentIntent.confirm", return_value=mock_intent):

        response = admin_logged_in_client.post("/api/purchases", json={
            "items": [
                {
                    "kit_id": kit.id,
                    "quantity": 2,
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
                "payment_method_id": "pm_mock_123",
                "email": "test@example.com",
                "name": "Test User",
                "address": {
                    "line1": "123 Main St",
                    "city": "Testville",
                    "state": "CA",
                    "postal_code": "12345",
                    "country": "US"
                }
            }
        }, headers=admin_auth_header)


        assert response.status_code == 201, response.get_data(as_text=True)
        data = response.get_json()
        assert isinstance(data, list)
        assert "inventory" in data[0]


