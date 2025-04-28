from flask import Blueprint

# Import all blueprints here
from app.routes.auth_routes import auth_bp
from app.routes.character_routes import character_bp
from app.routes.cart_routes import cart_bp
from app.routes.content_routes import content_bp
from app.routes.user_settings_routes import user_settings_bp
from app.routes.newsletter_routes import newsletter_bp
from app.routes.favorite_routes import favorite_bp
from app.routes.health_routes import health_bp

# Optionally create a master blueprint if desired (not required if registering in app factory)
def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(character_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(content_bp)
    app.register_blueprint(user_settings_bp)
    app.register_blueprint(newsletter_bp)
    app.register_blueprint(favorite_bp)
    app.register_blueprint(health_bp) 
