from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from app.config import Config
from datetime import timedelta
from sqlalchemy import create_engine, text
from flask_login import LoginManager

db = SQLAlchemy()
ma = Marshmallow()

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
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # MUST be None for ngrok to work
    app.config['SESSION_COOKIE_SECURE'] = True      # ngrok uses HTTPS

    # ✅ Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    login_manager.init_app(app) 

    # ✅ Log to confirm CORS origin is correct
    print("CORS_ORIGIN:", Config.CORS_ORIGIN)
    login_manager.login_view = "auth.login"

    # ✅ CORS needs to match frontend origin and allow credentials
    CORS(app, supports_credentials=True, origins=[Config.CORS_ORIGIN])

    # ✅ Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.cart_routes import cart_bp
    from app.routes.character_routes import character_bp
    from app.routes.content_routes import content_bp
    from app.routes.user_settings_routes import user_settings_bp
    from app.routes.newsletter_routes import newsletter_bp
    from app.routes.favorite_routes import favorite_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(character_bp)
    app.register_blueprint(content_bp)
    app.register_blueprint(user_settings_bp)
    app.register_blueprint(newsletter_bp)
    app.register_blueprint(favorite_bp)

    # Without the app context, Flask wouldn't know which app's configuration to use.     
    with app.app_context():
        create_database()
        db.create_all() # uses the schema to create the database tables  


    return app
