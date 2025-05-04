import pytest
from app import create_app
from app.extensions import db
from app.models.cart_item import CartItem
from flask import session

# @pytest.fixture
# def app():
#     app = create_app(testing=True)
#     app.config.update({
#         "TESTING": True,
#         "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
#         "SECRET_KEY": "test",
#         "WTF_CSRF_ENABLED": False,
#     })

#     with app.app_context():
#         db.create_all()
#         yield app
#         db.session.remove()
#         db.drop_all()

def test_get_empty_cart(logged_in_client):
    res = logged_in_client.get("/api/cart")
    assert res.status_code == 200
    assert res.json == []

def test_add_to_cart(logged_in_client, user_auth_header, create_test_kit):
    # Add first
    kit = create_test_kit
    res = logged_in_client.post("/api/cart", json={"kit_id": kit.id, "quantity": 2}, headers=user_auth_header)
    assert res.status_code == 201
    assert res.json["message"] == "Cart updated"

    # Verify added
    get_res = logged_in_client.get("/api/cart", headers=user_auth_header)
    assert get_res.status_code == 200
    assert get_res.json[0]["kit_id"] == kit.id
    assert get_res.json[0]["quantity"] == 2

    res = logged_in_client.delete("/api/cart/all", headers=user_auth_header)
    assert res.status_code == 200
    assert res.json["message"] == "All cart items deleted"

    assert logged_in_client.get("/api/cart", headers=user_auth_header).json == []

def test_update_cart_quantity(logged_in_client, user_auth_header, create_test_kit):
    # Add first
    kit = create_test_kit
    logged_in_client.post("/api/cart", json={"kit_id": kit.id, "quantity": 1}, headers=user_auth_header)
    item_id = logged_in_client.get("/api/cart").json[0]["id"]

    # Now update
    res = logged_in_client.put(f"/api/cart/{item_id}", json={"quantity": 5}, headers=user_auth_header)
    assert res.status_code == 200
    assert res.json["message"] == "Updated"

    # Check update
    updated = logged_in_client.get("/api/cart", headers=user_auth_header).json[0]
    assert updated["quantity"] == 5

    res = logged_in_client.delete("/api/cart/all", headers=user_auth_header)
    assert res.status_code == 200
    assert res.json["message"] == "All cart items deleted"

    assert logged_in_client.get("/api/cart", headers=user_auth_header).json == []

def test_delete_cart_item(logged_in_client, user_auth_header, create_test_kit):
    # Add first
    kit = create_test_kit
    logged_in_client.post("/api/cart", json={"kit_id": kit.id, "quantity": 1}, headers=user_auth_header)
    item_id = logged_in_client.get("/api/cart").json[0]["id"]

    res = logged_in_client.delete(f"/api/cart/{item_id}", headers=user_auth_header)
    assert res.status_code == 200
    assert res.json["message"] == "Deleted"

    assert logged_in_client.get("/api/cart", headers=user_auth_header).json == []

