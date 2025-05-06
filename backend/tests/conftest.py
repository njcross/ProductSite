import pytest
from app import create_app
from app.extensions import db as _db
from app.models.user import User  # adjust import based on your project structure
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.kits import Kit
from app.models.inventory import Inventory
from app.schemas.kit_schema import kit_schema, kits_schema
from app.schemas.inventory_schema import inventory_schema
from sqlalchemy.orm import scoped_session, sessionmaker


@pytest.fixture(scope="session")
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_ENGINE_OPTIONS": {"pool_pre_ping": True},
    })

    with app.app_context():
        _db.drop_all()
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()

@pytest.fixture(scope="session")
def db(app):
    # Provide SQLAlchemy instance for use
    return _db

@pytest.fixture(autouse=True)
def session(db, app):
    """Ensure each test gets a rollback."""
    with app.app_context():
        connection = db.engine.connect()
        transaction = connection.begin()

        session_factory = sessionmaker(bind=connection)
        session = scoped_session(session_factory)
        db.session = session

        yield session

        transaction.rollback()
        connection.close()
        session.remove()

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
            "image_url": "http://example.com/testkit.jpg"
        }
        kit_data = kit_schema.load(data)
        new_kit = Kit(**kit_data)
        _db.session.add(new_kit)
        _db.session.commit()  # COMMIT is needed for persistence
        _db.session.flush()  # ensures `id` is assigned
        _db.session.refresh(new_kit)  # binds instance to session with updated fields
        data2 = {
            "location": "empire state building",
            "coordinates": "0,0",
            "location_name": "test",
            "quantity": "1",
            "kit_id": new_kit.id
        }
        inventory_data = inventory_schema.load(data2)
        new_inventory = inventory_data
        _db.session.add(new_inventory)
        _db.session.commit()  # COMMIT is needed for persistence
        _db.session.flush()  # ensures `id` is assigned
        _db.session.refresh(new_inventory)  
        return _db.session.get(Kit, new_kit.id), _db.session.get(Inventory, new_inventory.id)
    

@pytest.fixture(scope="function")
def client(app):
    return app.test_client()

@pytest.fixture(scope="function")
def create_test_users(app):
    with app.app_context():
        _db.drop_all()
        _db.create_all()

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

        _db.session.add_all([user, admin])
        _db.session.commit()
        return user.id, admin.id

@pytest.fixture
def logged_in_client(client, create_test_users):
    user_id, _ = create_test_users
    with client.session_transaction() as sess:
        sess["user_id"] = user_id
    return client 

@pytest.fixture
def user_auth_header(client, create_test_users):
    """Logs in testuser and returns auth header."""
    res = client.post('/api/login', json={"username": "testuser", "password": "password123"})
    assert res.status_code == 200
    token = res.json.get("token", "")
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def admin_auth_header(client, create_test_users):
    """Logs in admin user and returns auth header."""
    res = client.post('/api/login', json={"username": "admin", "password": "password123"})
    assert res.status_code == 200
    token = res.json.get("token", "")
    return {'Authorization': f'Bearer {token}'}
