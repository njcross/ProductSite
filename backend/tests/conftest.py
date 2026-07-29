import os

# These must be set before importing app. Config values and auth serializers are
# initialized while the application modules are imported.
os.environ.setdefault("PRODUCTSITE_TESTING", "1")
os.environ.setdefault(
    "FLASK_SECRET_KEY",
    "productsite-pytest-only-secret-do-not-use-in-production",
)

import pytest
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db as _db
from app.models.inventory import Inventory
from app.models.kits import Kit
from app.models.user import User
from app.schemas.inventory_schema import inventory_schema
from app.schemas.kit_schema import kit_schema


@pytest.fixture(scope="session")
def app():
    application = create_app(
        {
            "TESTING": True,
            "SESSION_COOKIE_SECURE": False,
        }
    )

    yield application

    with application.app_context():
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(scope="session")
def db(app):
    return _db


@pytest.fixture(autouse=True)
def session(app):
    """Give every test a clean database without touching production MySQL."""
    with app.app_context():
        _db.session.remove()
        _db.drop_all()
        _db.create_all()

        try:
            yield _db.session
        finally:
            _db.session.rollback()
            _db.session.remove()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def create_test_kit_and_inventory(app):
    with app.app_context():
        data = {
            "name": "Test Kit",
            "description": "This is a test kit.",
            "price": 19.99,
            "image_url": "http://example.com/testkit.jpg",
        }
        kit_data = kit_schema.load(data)
        new_kit = Kit(**kit_data)
        _db.session.add(new_kit)
        _db.session.commit()
        _db.session.flush()
        _db.session.refresh(new_kit)

        data2 = {
            "location": "empire state building",
            "coordinates": "0,0",
            "location_name": "test",
            "quantity": "1",
            "kit_id": new_kit.id,
        }
        inventory_data = inventory_schema.load(data2)
        new_inventory = inventory_data
        _db.session.add(new_inventory)
        _db.session.commit()
        _db.session.flush()
        _db.session.refresh(new_inventory)

        return (
            _db.session.get(Kit, new_kit.id),
            _db.session.get(Inventory, new_inventory.id),
        )


@pytest.fixture
def create_test_kit(app):
    with app.app_context():
        data = {
            "name": "Test Kit",
            "description": "This is a test kit.",
            "price": 19.99,
            "image_url": "http://example.com/testkit.jpg",
        }
        kit_data = kit_schema.load(data)
        new_kit = Kit(**kit_data)
        _db.session.add(new_kit)
        _db.session.commit()
        _db.session.flush()
        _db.session.refresh(new_kit)
        return _db.session.get(Kit, new_kit.id)


@pytest.fixture(scope="function")
def create_test_users(app):
    with app.app_context():
        _db.session.remove()
        _db.drop_all()
        _db.create_all()

        user = User(
            username="testuser",
            email="testuser@example.com",
            password=generate_password_hash("password123"),
            role="customer",
            active=True,
        )
        admin = User(
            username="admin",
            email="admin@example.com",
            password=generate_password_hash("password123"),
            role="admin",
            active=True,
        )

        _db.session.add_all([user, admin])
        _db.session.commit()
        return user.id, admin.id


@pytest.fixture
def admin_logged_in_client(client, create_test_users):
    _, admin_id = create_test_users
    with client.session_transaction() as sess:
        sess["user_id"] = admin_id
        sess["role"] = "admin"
    return client


@pytest.fixture
def logged_in_client(client, create_test_users):
    user_id, _ = create_test_users
    with client.session_transaction() as sess:
        sess["user_id"] = user_id
    return client


@pytest.fixture
def user_auth_header(client, create_test_users):
    """Log in testuser and return an authorization header when supplied."""
    response = client.post(
        "/api/login",
        json={"username": "testuser", "password": "password123"},
    )
    assert response.status_code == 200
    token = response.json.get("token", "")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_header(client, create_test_users):
    """Log in admin and return an authorization header when supplied."""
    response = client.post(
        "/api/login",
        json={"username": "admin", "password": "password123"},
    )
    assert response.status_code == 200
    token = response.json.get("token", "")
    return {"Authorization": f"Bearer {token}"}