from flask import Blueprint, request, jsonify, session, current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import select
from app.extensions import db
from app.models.user import User
from app.schemas.user_schema import user_schema, UserSchema
from flask import redirect, url_for
from flask_dance.contrib.google import make_google_blueprint, g, google
from flask_cors import cross_origin

google_bp = make_google_blueprint(
    scope=["profile", "email"],
    redirect_url="/login/google_login"
)


auth_bp = Blueprint('auth', __name__, url_prefix='/api')
user_schema = UserSchema()

serializer = URLSafeTimedSerializer("super-secret-key")  # Replace with secure key

@auth_bp.route("/google_login")
def google_login():
    if not google.authorized:
        return redirect(url_for("google.login"))

    resp = google.get("/oauth2/v2/userinfo")
    if not resp.ok:
        return "Failed to fetch user info", 400

    info = resp.json()
    email = info["email"]
    username = info.get("name", email.split('@')[0])

    user = User.query.filter_by(email=email).first()

    if not user:
        user = User(
            username=username,
            email=email,
            password=None,  # No password for OAuth users
            role='user',
            oauth_provider = "google"
        )
        db.session.add(user)
        db.session.commit()

    # Store user_id in session
    session["user_id"] = user.id

    return redirect("/")  # Or wherever you want

@auth_bp.route('/login', methods=['OPTIONS'])
@cross_origin(supports_credentials=True)
def login_options():
    return '', 200

@auth_bp.route('/register', methods=['OPTIONS'])
@cross_origin(supports_credentials=True)
def register_options():
    return '', 200

@auth_bp.route('/token-login', methods=['POST'])
def token_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        token = serializer.dumps({"user_id": user.id})
        return jsonify({"token": token, "user": {"username": user.username, "role": user.role}}), 200
    return jsonify({"message": "Invalid credentials"}), 401


@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    data = request.get_json()
    token = data.get('token')

    try:
        user_data = serializer.loads(token, max_age=3600)  # Token valid for 1 hour
        user_id = user_data["user_id"]
        user = User.query.get(user_id)
        if user:
            return jsonify({"user": {"username": user.username, "role": user.role}}), 200
    except SignatureExpired:
        return jsonify({"message": "Token expired"}), 403
    except BadSignature:
        return jsonify({"message": "Invalid token"}), 403

    return jsonify({"message": "Unauthorized"}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        data['role']='customer'
        del data['confirmPassword']
        user_data = user_schema.load(data)
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            password=generate_password_hash(user_data['password']),
            role='customer'
        )
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.id
        session['role'] = user.role
        session.permanent = True
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = db.session.execute(select(User).where(User.username == data['username'])).scalar_one_or_none()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials"}), 401
    session['user_id'] = user.id
    session['role'] = user.role
    session.permanent = True
    return jsonify({
        "message": "Login successful",
        "user": {"username": user.username, "email": user.email, "role": user.role, "id": user.id} 
    }), 200

@auth_bp.route('/check-login', methods=['OPTIONS'])
@cross_origin(supports_credentials=True)
def options_favorites():
    return '', 200

@auth_bp.route('/check-login', methods=['GET'])
def check_login():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"loggedIn": False})
    user = db.session.get(User, user_id)
    return jsonify({"loggedIn": True, "user": user_schema.dump(user)})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out"})
