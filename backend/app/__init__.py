import os
import tempfile
from datetime import timedelta

import redis
from authlib.integrations.flask_client import OAuth
from flask import Flask, redirect, session, url_for
from flask_cors import CORS
from flask_login import LoginManager
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, text
from sqlalchemy.pool import StaticPool

from app.config import Config
from app.extensions import db, ma, migrate, redis_client
from app.models.user import User

login_manager = LoginManager()
oauth = OAuth()


def create_database(root_database_url):
    """Create the production MySQL database when it does not already exist."""
    if not root_database_url:
        raise RuntimeError(
            "ROOT_DATABASE_URL is not configured. Set it in the backend environment."
        )

    root_engine = create_engine(root_database_url)
    try:
        with root_engine.begin() as connection:
            connection.execute(text("CREATE DATABASE IF NOT EXISTS marvel"))
    finally:
        root_engine.dispose()


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)

    # Production defaults. A test configuration is applied below, before any
    # Flask extension is initialized.
    app.config.update(
        PERMANENT_SESSION_LIFETIME=timedelta(days=7),
        SESSION_COOKIE_SECURE=True,
        SESSION_TYPE="redis",
        SESSION_PERMANENT=False,
        SESSION_USE_SIGNER=True,
        SESSION_KEY_PREFIX="session:",
        SESSION_REDIS=redis.StrictRedis(host="localhost", port=6379, db=0),
    )

    # tests/conftest.py sets PRODUCTSITE_TESTING before importing this module.
    # These defaults also cover the older test modules that call create_app()
    # directly and try to set TESTING only after app creation.
    if os.getenv("PRODUCTSITE_TESTING") == "1":
        app.config.update(
            TESTING=True,
            SECRET_KEY=os.getenv(
                "FLASK_SECRET_KEY",
                "productsite-pytest-only-secret-do-not-use-in-production",
            ),
            SQLALCHEMY_DATABASE_URI="sqlite://",
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            SQLALCHEMY_ENGINE_OPTIONS={
                "connect_args": {"check_same_thread": False},
                "poolclass": StaticPool,
            },
            SESSION_TYPE="filesystem",
            SESSION_FILE_DIR=tempfile.mkdtemp(
                prefix="productsite-pytest-sessions-"
            ),
            SESSION_COOKIE_SECURE=False,
            SESSION_PERMANENT=False,
            SESSION_USE_SIGNER=True,
            SESSION_KEY_PREFIX="test-session:",
            CORS_ORIGIN=["http://localhost", "http://127.0.0.1"],
            GOOGLE_CLIENT_ID="test-google-client-id",
            GOOGLE_CLIENT_SECRET="test-google-client-secret",
            FRONTEND_URL="http://localhost:3000",
            STRIPE_SECRET_KEY="sk_test_placeholder",
        )

    # Explicit values supplied by a caller take final precedence. This is the
    # standard app-factory pattern used by the test fixture.
    if test_config:
        app.config.update(test_config)

    app.secret_key = app.config.get("SECRET_KEY")
    if not app.secret_key:
        raise RuntimeError(
            "SECRET_KEY is not configured. Set FLASK_SECRET_KEY in the backend environment."
        )

    if not app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise RuntimeError(
            "SQLALCHEMY_DATABASE_URI is not configured. Set DATABASE_URL in the "
            "backend environment, or pass a test database URI to create_app()."
        )

    db.init_app(app)
    ma.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    Session(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    cors_origins = app.config.get("CORS_ORIGIN") or []
    if isinstance(cors_origins, str):
        cors_origins = [cors_origins]
    cors_origins = [origin for origin in cors_origins if origin]

    print("CORS_ORIGIN:", cors_origins)
    login_manager.login_view = "auth.login"
    CORS(app, supports_credentials=True, origins=cors_origins)

    oauth.init_app(app)
    oauth.register(
        name="google",
        client_id=app.config.get("GOOGLE_CLIENT_ID"),
        client_secret=app.config.get("GOOGLE_CLIENT_SECRET"),
        server_metadata_url=(
            "https://accounts.google.com/.well-known/openid-configuration"
        ),
        client_kwargs={
            "scope": "openid email profile",
        },
    )

    @app.route("/api/login/google")
    def login_google():
        redirect_uri = url_for("auth_google_callback", _external=True)
        return oauth.google.authorize_redirect(redirect_uri)

    @app.route("/api/login/google/authorized")
    def auth_google_callback():
        oauth.google.authorize_access_token()
        user_info = oauth.google.userinfo()

        email = user_info.get("email")
        username = user_info.get("name", email.split("@")[0])
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                username=username,
                email=email,
                password="",
                role="customer",
                oauth_provider="google",
            )
            db.session.add(user)
            db.session.commit()
        session["user_id"] = user.id

        from flask import render_template_string

        return render_template_string(
            """
        <html>
            <head>
            <script>
                window.opener = null;
                window.location.href = 'https://myplaytray.com/cards';
            </script>
            </head>
            <body>
            Redirecting...
            </body>
        </html>
        """
        )

    from app.routes.auth_routes import auth_bp
    from app.routes.cart_routes import cart_bp
    from app.routes.checkout_routes import checkout_bp
    from app.routes.content_routes import content_bp
    from app.routes.favorite_routes import favorite_bp
    from app.routes.health_routes import health_bp
    from app.routes.inventory_routes import inventory_bp
    from app.routes.kit_routes import kit_bp
    from app.routes.newsletter_message_routes import newsletter_message_bp
    from app.routes.newsletter_routes import newsletter_bp
    from app.routes.purchase_routes import purchase_bp
    from app.routes.resource_routes import resource_bp
    from app.routes.review_routes import review_bp
    from app.routes.shipping_address_routes import shipping_bp
    from app.routes.user_settings_routes import user_settings_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(kit_bp)
    app.register_blueprint(content_bp)
    app.register_blueprint(user_settings_bp)
    app.register_blueprint(newsletter_bp)
    app.register_blueprint(favorite_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(purchase_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(resource_bp)
    app.register_blueprint(checkout_bp)
    app.register_blueprint(shipping_bp)
    app.register_blueprint(newsletter_message_bp)

    with app.app_context():
        if app.config.get("TESTING"):
            # Each test-created app gets an isolated in-memory SQLite database.
            # Do not connect to or create the production MySQL database here.
            db.create_all()
        else:
            create_database(app.config.get("ROOT_DATABASE_URL"))
            try:
                db.create_all()
                print("Database tables created!")
            except Exception as exc:
                print("DB setup failed:", str(exc))

    return app