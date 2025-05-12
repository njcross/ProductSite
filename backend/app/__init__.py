import flask
from flask_dance.contrib.google import make_google_blueprint, google
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from app.config import Config
from datetime import timedelta
from sqlalchemy import create_engine, text
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_dance.consumer import oauth_authorized
from flask_login import login_user
from flask_session import Session
from app.models.user import User
from app.extensions import db, ma, migrate
from flask import Flask, session, redirect
import redis


def create_database():
    root_engine = create_engine(Config.ROOT_DATABASE_URL)  # No database specified
    with root_engine.connect() as connection:
        connection.execute(text("CREATE DATABASE IF NOT EXISTS marvel"))



login_manager = LoginManager()
  
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # ✅ Correct secret key
    app.secret_key = Config.SECRET_KEY

    # ✅ Session settings for cross-origin auth
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE'] = True      # ngrok uses HTTPS
    app.config["GOOGLE_OAUTH_CLIENT_ID"] = Config.GOOGLE_CLIENT_ID
    app.config["GOOGLE_OAUTH_CLIENT_SECRET"] = Config.GOOGLE_CLIENT_SECRET
    # Redis session configuration
    app.config['SESSION_TYPE'] = 'redis'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_KEY_PREFIX'] = 'session:'
    app.config['SESSION_REDIS'] = redis.StrictRedis(host='localhost', port=6379, db=0)
    google_bp = make_google_blueprint(
        scope=[
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid"
        ],
        redirect_url="https://myplaytray.com/api/login/google/authorized",
        client_id=Config.GOOGLE_CLIENT_ID,
        client_secret=Config.GOOGLE_CLIENT_SECRET
    )

    # ✅ Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    login_manager.init_app(app) 
    Session(app)

    migrate.init_app(app, db)

    # ✅ Log to confirm CORS origin is correct
    print("CORS_ORIGIN:", Config.CORS_ORIGIN)
    login_manager.login_view = "auth.login"

    # ✅ CORS needs to match frontend origin and allow credentials
    CORS(app, supports_credentials=True, origins=Config.CORS_ORIGIN)

    # ✅ Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.cart_routes import cart_bp
    from app.routes.kit_routes import kit_bp
    from app.routes.content_routes import content_bp
    from app.routes.user_settings_routes import user_settings_bp
    from app.routes.newsletter_routes import newsletter_bp
    from app.routes.favorite_routes import favorite_bp
    from app.routes.health_routes import health_bp
    from app.routes.review_routes import review_bp
    from app.routes.purchase_routes import purchase_bp
    from app.routes.inventory_routes import inventory_bp

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
    app.register_blueprint(google_bp, url_prefix="/api/login")
    @oauth_authorized.connect_via(google_bp)
    def google_logged_in(blueprint, token):
        if not token:
            return False

        resp = blueprint.session.get("/oauth2/v2/userinfo")
        if not resp.ok:
            return False

        info = resp.json()
        email = info["email"]
        username = info.get("name", email.split('@')[0])

        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                username=username,
                email=email,
                password="",
                role='customer',
                oauth_provider='google'
            )
            db.session.add(user)
            db.session.commit()

        session["user_id"] = user.id

        return redirect("https://myplaytray.com/cards")

    # Without the app context, Flask wouldn't know which app's configuration to use.     
    with app.app_context():
        create_database()
        try:
            db.create_all()
            print("Database tables created!")
        except Exception as e:
            print("DB setup failed:", str(e))
            # uses the schema to create the database tables  


    return app
