import pytest
from app import create_app
from app.extensions import db
from app.models import User  # adjust import based on your project structure
from werkzeug.security import generate_password_hash, check_password_hash


@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",  # or your MySQL if you insist
        "WTF_CSRF_ENABLED": False,
        "SECRET_KEY": "testsecret"
    })

    with app.app_context():
        db.create_all()
        yield app

        # Teardown: clean database after test
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def create_test_users():
    # Setup
    user = User(
        username="testuser",
        email="testuser@example.com",
        password=generate_password_hash("password123"),
        role="customer"
    )
    admin = User(
        username="admin",
        email="admin@example.com",
        password=generate_password_hash("password123"),
        role="admin"
    )
    db.session.add_all([user, admin])
    db.session.commit()
     # Setup a dummy character (ID will be 1 if table is empty)
    from backend.app.models.kits import Character
    character = Character(
        name="Test Hero",
        alias="Tester",
        alignment="hero",
        powers="Testing everything",
        image_url="http://example.com/test-hero.jpg"
    )
    db.session.add(character)
    db.session.commit()

    yield  # run the actual test

    # Teardown
    from app.models.favorite import Favorite  # Import your Favorite model if needed
    db.session.query(Favorite).delete()  # 💥 Delete favorites first (child)
    db.session.query(Character).delete() # 💥 Then characters
    db.session.query(User).delete()      # 💥 Finally users
    db.session.commit()
    

@pytest.fixture
def user_auth_header(client, create_test_users):
    """Logs in testuser and returns auth header."""
    res = client.post('/login', json={"username": "testuser", "password": "password123"})
    assert res.status_code == 200
    token = res.json.get("token", "")
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def admin_auth_header(client, create_test_users):
    """Logs in admin user and returns auth header."""
    res = client.post('/login', json={"username": "admin", "password": "password123"})
    assert res.status_code == 200
    token = res.json.get("token", "")
    return {'Authorization': f'Bearer {token}'}
