import pytest

def test_register(client):
    response = client.post('/register', json={
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123",
    })
    assert response.status_code == 201
    assert "message" in response.json

def test_login(client, create_test_users):
    # Create the users first using the fixture (now they exist)
    response = client.post('/logout')
    assert response.status_code == 200

    # Now login
    response = client.post('/login', json={
        "username": "testuser",
        "password": "password123"
    })
    print(response)
    assert response.status_code == 200
    assert "user" in response.json
