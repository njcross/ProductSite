from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from app.config import Config
from datetime import timedelta

db = SQLAlchemy()
ma = Marshmallow()

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

    # ✅ Log to confirm CORS origin is correct
    print("CORS_ORIGIN:", Config.CORS_ORIGIN)

    # ✅ CORS needs to match frontend origin and allow credentials
    CORS(app, supports_credentials=True, origins=[Config.CORS_ORIGIN])

    # ✅ Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.cart_routes import cart_bp
    from app.routes.character_routes import character_bp
    from app.routes.content_routes import content_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(character_bp)
    app.register_blueprint(content_bp)

    return app
