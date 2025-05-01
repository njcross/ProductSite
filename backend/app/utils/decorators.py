from flask import session, jsonify, g
from functools import wraps
from app.models.user import User
from app.extensions import db

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return wrapper

def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user_id = session.get("user_id")

        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        user = db.session.get(User, user_id)
        if not user or user.role.lower() != "admin":
            return jsonify({"error": "Admin access required"}), 403

        g.current_user = user  # Optionally set for use in route
        return f(*args, **kwargs)
    return wrapper
