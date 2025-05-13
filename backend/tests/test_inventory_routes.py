
import pytest
from flask import json
from app.models.inventory import Inventory
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def sample_inventory_data():
    return {
        "kit_id": 1,
        "quantity": 10,
        "location": "the white house",
        "location_name": "The White House",
        "no_address_lookup": True
    }

def test_get_inventory(admin_logged_in_client, admin_auth_header):
    response = admin_logged_in_client.get("/api/inventory", headers=admin_auth_header)
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)

def test_create_inventory(admin_logged_in_client, create_test_kit, admin_auth_header, sample_inventory_data):
    kit = create_test_kit
    sample_inventory_data["kit_id"] = kit.id
    response = admin_logged_in_client.post("/api/inventory", json=sample_inventory_data, headers=admin_auth_header)
    assert response.status_code == 201
    data = response.get_json()
    assert "inventory" in data
    assert data["inventory"] == sample_inventory_data["kit_id"]

def test_update_inventory(admin_logged_in_client, create_test_kit, admin_auth_header, sample_inventory_data):
    # First create the inventory
    kit = create_test_kit
    sample_inventory_data["kit_id"] = kit.id
    create_resp = admin_logged_in_client.post("/api/inventory", json=sample_inventory_data, headers=admin_auth_header)
    data = create_resp.get_json()
    inventory_id = create_resp.get_json()["inventory"]

    update_data = {"no_address_lookup": True, "quantity": 25, "kit_id": kit.id, "location": sample_inventory_data["location"]}
    response = admin_logged_in_client.put("/api/inventory", json=update_data, headers=admin_auth_header)
    assert response.status_code == 200
    assert response.get_json()["message"] == "Inventory updated"

def test_delete_inventory(admin_logged_in_client, admin_auth_header, create_test_kit, sample_inventory_data):
    # First create the inventory
    kit = create_test_kit
    sample_inventory_data["kit_id"] = kit.id
    create_resp = admin_logged_in_client.post("/api/inventory", json=sample_inventory_data, headers=admin_auth_header)
    inventory_id = create_resp.get_json()["inventory"]

    response = admin_logged_in_client.delete("/api/inventory",query_string={"kit_id": kit.id, "location": sample_inventory_data['location']}, headers=admin_auth_header)
    assert response.status_code == 200
    assert response.get_json()["message"] == "Inventory deleted"
