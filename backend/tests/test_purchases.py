import pytest

def test_list_purchases(client, user_auth_header):
    res = client.get("/api/purchases/", headers=user_auth_header)
    assert res.status_code in (200, 404)

def test_checkout(client, user_auth_header, create_test_kit):
    # First add kit to cart
    res = client.post("/api/cart", json={"kit_id": create_test_kit.id, "quantity": 1}, headers=user_auth_header)
    assert res.status_code == 201
    res = client.post("/api/purchases", json={
        "kit_id": create_test_kit.id,
        "quantity": 1
    }, headers=user_auth_header)
    assert res.status_code == 201