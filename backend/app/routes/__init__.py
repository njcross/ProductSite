from flask import Blueprint

# Import all blueprints here
from app.routes.auth_routes import auth_bp
from app.routes.character_routes import character_bp
from app.routes.cart_routes import cart_bp

# Optionally create a master blueprint if desired (not required if registering in app factory)
def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(character_bp)
    app.register_blueprint(cart_bp)
