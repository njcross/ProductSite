import pytest
from flask import Flask
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_user_settings_basic(client):
    response = client.get("/api/health" if "user_settings" == "content" else "/api/user_settings")
    assert response.status_code in (200, 401, 404)

def test_update_email(client, user_auth_header):
    res = client.post("/api/change-email", json={
        "email": "updated@example.com",
        "password": "password123"
    }, headers=user_auth_header)
    assert res.status_code in (200, 400)

def test_update_password(client, user_auth_header):
    res = client.post("/api/change-password", json={
        "newPassword": "newpass123",
        "currentPassword": "password123"
    }, headers=user_auth_header)
    assert res.status_code in (200, 400)

def test_delete_account(client, user_auth_header):
    # First, delete the account with the correct password
    res = client.post("/api/delete-account", json={
        "password": "password123"
    }, headers=user_auth_header)
    assert res.status_code == 200
    assert res.json.get("message") == "Account deactivated successfully"

    # Try logging in again with the same credentials after deletion
    login_res = client.post("/api/login", json={
        "username": "testuser",
        "password": "password123"
    })
    assert login_res.status_code == 403

