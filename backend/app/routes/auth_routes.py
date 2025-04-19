from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import select
from app import db
from app.models.user import User
from app.schemas.user_schema import user_schema, UserSchema



auth_bp = Blueprint('auth', __name__)
user_schema = UserSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        user_data = user_schema.load(data)
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            password=generate_password_hash(user_data['password']),
            role='customer'
        )
        db.session.add(user)
        db.session.commit()
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
    session.permanent = True
    return jsonify({
        "message": "Login successful",
        "user": {"username": user.username, "email": user.email, "role": user.role}
    }), 200

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
