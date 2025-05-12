from flask import Blueprint, request, jsonify, session, current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import select
from app.extensions import db
from app.models.user import User
from app.schemas.user_schema import user_schema, UserSchema
from flask_cors import cross_origin
from app.utils.decorators import login_required
from flask import redirect


auth_bp = Blueprint('auth', __name__, url_prefix='/api')
user_schema = UserSchema()

serializer = URLSafeTimedSerializer("super-secret-key")  # Replace with secure key

# @auth_bp.route("/google_login")
# def google_login():
#     if not google.authorized:
#         return redirect(url_for("google.login"))

#     resp = google.get("/oauth2/v2/userinfo")
#     if not resp.ok:
#         return "Failed to fetch user info", 400

#     info = resp.json()
#     email = info["email"]
#     username = info.get("name", email.split('@')[0])

#     user = User.query.filter_by(email=email).first()

#     if not user:
#         user = User(
#             username=username,
#             email=email,
#             password=None,  # No password for OAuth users
#             role='user',
#             oauth_provider = "google"
#         )
#         db.session.add(user)
#         db.session.commit()

#     # Store user_id in session
#     session["user_id"] = user.id

#     return redirect("/")  # Or wherever you want

@auth_bp.route('/login', methods=['OPTIONS'])
def login_options():
    return '', 200

@auth_bp.route('/register', methods=['OPTIONS'])
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

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = db.session.execute(select(User).where(User.username == data['username'])).scalar_one_or_none()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials"}), 401

    if not user.active:
        return jsonify({"message": "Account is deactivated"}), 403

    session['user_id'] = user.id
    session['role'] = user.role
    session.permanent = True
    return jsonify({
        "message": "Login successful",
        "user": {"username": user.username, "email": user.email, "role": user.role, "id": user.id}
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    data['role'] = 'customer'
    del data['confirmPassword']
    email = data.get('email')

    existing = User.query.filter_by(email=email).first()

    if existing:
        if existing.active:
            return jsonify({"message": "Email is already registered"}), 400
        elif data.get('restore') == False:
            return jsonify({"message": "Account exists but is deactivated", "canRestore": True}), 409
        elif data.get('restore') == True:
            current_password = data.get('password')

            if not existing or not check_password_hash(existing.password, current_password):
                return jsonify({"message": "Incorrect current password"}), 401
            existing.active = True
            db.session.commit()
            session['user_id'] = existing.id
            session['role'] = existing.role
            session.permanent = True
            return jsonify({"message": "Account restored successfully"}), 200
    del data['restore']
    user_data = user_schema.load(data)
    user = User(
        username=user_data['username'],
        email=user_data['email'],
        password=generate_password_hash(user_data['password']),
        role='customer',
        active=True
    )
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id
    session['role'] = user.role
    session.permanent = True
    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/check-email-status', methods=['POST'])
def check_email_status():
    email = request.json.get('email')
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"exists": False}), 200
    return jsonify({
        "exists": True,
        "active": user.active,
        "username": user.username
    }), 200


@auth_bp.route('/check-login', methods=['GET'])
@login_required
def check_login():
    session.modified = True
    user = db.session.get(User, session['user_id'])
    return jsonify({"loggedIn": True, "user": user_schema.dump(user)})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.clear()
    return redirect("/login")
