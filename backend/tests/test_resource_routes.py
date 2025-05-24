import json
import pytest
from app import create_app, db
from app.models.resource import Resource

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def test_get_resources_empty(client):
    response = client.get('/api/resources')
    assert response.status_code == 200
    assert response.get_json() == []

def test_post_and_get_resource(admin_logged_in_client, admin_auth_header):
    data = {
        "title": "Test Resource",
        "description": "Test Description",
        "thumbnail_url": "https://example.com/thumb.jpg",
        "file_url": "https://example.com/file.pdf"
    }
    post_response = admin_logged_in_client.post('/api/resources', json=data, headers=admin_auth_header)
    assert post_response.status_code == 201
    resource_id = post_response.get_json()["id"]

    get_response = admin_logged_in_client.get('/api/resources')
    assert get_response.status_code == 200
    assert any(r["title"] == "Test Resource" for r in get_response.get_json())

    delete_response = admin_logged_in_client.delete(f'/api/resources/{resource_id}')
    assert delete_response.status_code == 204
