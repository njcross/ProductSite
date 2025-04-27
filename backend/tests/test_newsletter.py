from app.routes.newsletter_routes import newsletter_bp

def create_app():
    app = Flask(__name__)
    # your config...

    app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")
    # and register other blueprints...

    return app

def test_add_newsletter_email(client, user_auth_header):
    res = client.post('/api/newsletter/subscribe', json={"email": "fetch@newsletter.com", "newsletter_value": "1"}, headers=user_auth_header)
    assert res.status_code == 201

def test_get_newsletter_emails(client, admin_auth_header):
    client.post('/api/newsletter/subscribe', json={"email": "fetch@newsletter.com", "value": "1"})
    res = client.get('/api/newsletter/list?value=1', headers=admin_auth_header)
    assert res.status_code == 200
