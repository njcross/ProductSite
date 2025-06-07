from flask import Flask, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_session import Session
from authlib.integrations.flask_client import OAuth
from datetime import timedelta
from sqlalchemy import create_engine, text
import redis

from app.config import Config
from app.models.user import User
from app.extensions import db, ma, migrate, redis_client

login_manager = LoginManager()
oauth = OAuth()

def create_database():
    root_engine = create_engine(Config.ROOT_DATABASE_URL)
    with root_engine.connect() as connection:
        connection.execute(text("CREATE DATABASE IF NOT EXISTS marvel"))

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.secret_key = Config.SECRET_KEY
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_TYPE'] = 'redis'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_KEY_PREFIX'] = 'session:'
    app.config['SESSION_REDIS'] = redis.StrictRedis(host='localhost', port=6379, db=0)

    db.init_app(app)
    ma.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    Session(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))


    print("CORS_ORIGIN:", Config.CORS_ORIGIN)
    login_manager.login_view = "auth.login"
    CORS(app, supports_credentials=True, origins=Config.CORS_ORIGIN)

    oauth.init_app(app)
    oauth.register(
        name='google',
        client_id=Config.GOOGLE_CLIENT_ID,
        client_secret=Config.GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
        }
    )

    @app.route('/api/login/google')
    def login_google():
        redirect_uri = url_for('auth_google_callback', _external=True)
        return oauth.google.authorize_redirect(redirect_uri)

    @app.route('/api/login/google/authorized')
    def auth_google_callback():
        token = oauth.google.authorize_access_token()
        user_info = oauth.google.userinfo()

        email = user_info.get('email')
        username = user_info.get('name', email.split('@')[0])

        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(username=username, email=email, password='', role='customer', oauth_provider='google')
            db.session.add(user)
            db.session.commit()

        session['user_id'] = user.id
        from flask import render_template_string
        # return
        return render_template_string("""
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
        """)

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
    from app.routes.resource_routes import resource_bp
    from app.routes.checkout_routes import checkout_bp
    from app.routes.shipping_address_routes import shipping_bp
    from app.routes.newsletter_message_routes import newsletter_message_bp

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
        create_database()
        try:
            db.create_all()
            print("Database tables created!")
        except Exception as e:
            print("DB setup failed:", str(e))

    return app
