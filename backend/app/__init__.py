from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
ma = Marshmallow()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    ma.init_app(app)
    CORS(app, supports_credentials=True, origins=[Config.CORS_ORIGIN])

    # Register all blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.cart_routes import cart_bp
    from app.routes.character_routes import character_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(character_bp)  # 👈 this was missing!

    return app
