import pytest
from app import create_app
def test_register(client):
    response = client.post(
        "/api/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123",
            "confirmPassword": "password123",
            "restore": False,
        },
    )

    assert response.status_code == 201, response.get_json()
    assert "message" in response.get_json()


def test_login(client, create_test_users):
    # create_test_users inserts testuser and admin into the same
    # application/database used by the shared client fixture.
    response = client.post("/api/logout")
    assert response.status_code == 200, response.get_json()

    response = client.post(
        "/api/login",
        json={
            "username": "testuser",
            "password": "password123",
        },
    )

    assert response.status_code == 200, response.get_json()

    data = response.get_json()
    assert "user" in data
    assert data["user"]["username"] == "testuser"


def test_auth_basic(client):
    response = client.get("/api/auth")
    assert response.status_code in (200, 401, 404)
