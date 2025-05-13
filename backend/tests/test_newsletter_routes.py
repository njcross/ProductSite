import pytest
from flask import url_for
from app import create_app, db

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def test_unsubscribe_newsletter(client):
    client.post("/api/newsletter/subscribe", json={
        "email": "remove@newsletter.com",
        "newsletter_value": "2"
    })
    res = client.post("/api/newsletter/unsubscribe", json={"email": "remove@newsletter.com"})
    assert res.status_code == 200
    
def test_newsletter_routes_basic(client):
    response = client.get('/api/')
    assert response.status_code in [200, 401, 404]

def test_newsletter_subscription(client):
    response = client.post("/api/newsletter/subscribe", json={"newsletter_value":"1","email": "test@example.com"})
    assert response.status_code == 201
    data = response.get_json()
    assert data.get("message") == "Subscribed successfully"

