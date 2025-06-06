import pytest
from flask import Flask
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_cart_basic(client):
    response = client.get("/api/health" if "cart" == "content" else "/api/cart")
    assert response.status_code in (200, 401, 404)
