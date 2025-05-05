import flask
import pytest
from flask import session
def test_get_favorites(client, user_auth_header, create_test_users, create_test_kit_and_inventory):
    # session.user_id = create_test_users[0].id
    kit, inventory = create_test_kit_and_inventory;
    res_add = client.post("/api/favorites/", json={"character_id": kit.id}, headers=user_auth_header)
    assert res_add.status_code == 201

    res_get = client.get("/api/favorites/", headers=user_auth_header)
    assert res_get.status_code == 200
    assert any(fav["kit"]["id"] == kit.id for fav in res_get.json)
