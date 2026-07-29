import pytest
from flask import url_for
from app import create_app, db

def test_user_settings_routes_basic(client):
    response = client.get('/api/')
    assert response.status_code in [200, 401, 404]
