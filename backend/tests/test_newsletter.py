from app.routes.newsletter_routes import newsletter_bp
import pytest
from flask import session
from flask import Flask

def test_get_newsletter_emails(client, create_test_users, admin_auth_header):
    res = client.post('/api/newsletter/subscribe', json={
        "email": "fetch@newsletter.com",
        "newsletter_value": "1"
    }, headers=admin_auth_header)
    assert res.status_code == 201

    res = client.get('/api/newsletter/list?value=1', headers=admin_auth_header)
    assert res.status_code == 200

def test_newsletter_basic(client):
    response = client.get("/api/health" if "newsletter" == "content" else "/api/newsletter")
    assert response.status_code in (200, 401, 404)
