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

def test_newsletter_routes_basic(client):
    response = client.get('/api/')
    assert response.status_code in [200, 401, 404]
