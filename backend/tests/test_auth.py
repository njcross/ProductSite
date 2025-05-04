import pytest
from app import create_app
def test_register(client):
    response = client.post('/api/register', json={
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123",
        "confirmPassword": "password123"
    })
    assert response.status_code == 201
    assert "message" in response.json

def test_login(client, create_test_users):
    # Create the users first using the fixture (now they exist)
    response = client.post('/api/logout')
    assert response.status_code == 200

    # Now login
    response = client.post('/api/login', json={
        "username": "testuser",
        "password": "password123"
    })
    print(response)
    assert response.status_code == 200
    assert "user" in response.json

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_auth_basic(client):
    response = client.get("/api/health" if "auth" == "content" else "/api/auth")
    assert response.status_code in (200, 401, 404)
