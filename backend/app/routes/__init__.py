from flask import Blueprint

# Import all blueprints here
from app.routes.auth_routes import auth_bp
from app.routes.kit_routes import kit_bp
from app.routes.cart_routes import cart_bp
from app.routes.content_routes import content_bp
from app.routes.user_settings_routes import user_settings_bp
from app.routes.newsletter_routes import newsletter_bp
from app.routes.favorite_routes import favorite_bp
from app.routes.health_routes import health_bp
from app.routes.review_routes import review_bp
from app.routes.purchase_routes import purchase_bp
from app.routes.inventory_routes import inventory_bp
from app.routes.resource_routes import resource_bp

# Optionally create a master blueprint if desired (not required if registering in app factory)
def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(kit_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(content_bp)
    app.register_blueprint(user_settings_bp)
    app.register_blueprint(newsletter_bp)
    app.register_blueprint(favorite_bp)
    app.register_blueprint(health_bp) 
    app.register_blueprint(review_bp)
    app.register_blueprint(purchase_bp)
    app.register.blueprint(inventory_bp)
    app.register_blueprint(resource_bp)
