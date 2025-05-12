from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from app.extensions import db
from flask import session
from app.models.user import User
from app.utils.decorators import login_required

user_settings_bp = Blueprint('user_settings', __name__, url_prefix='/api')

@user_settings_bp.route('/change-email', methods=['POST'])
@login_required
def change_email():
    data = request.json
    new_email = data.get('email')
    password = data.get('password')
    user_id = session.get('user_id')
    user = db.session.get(User, user_id)

    if not check_password_hash(user.password, password):
        return jsonify({"message": "Incorrect password"}), 401

    user.email = new_email
    db.session.commit()
    return jsonify({"message": "Email updated successfully"}), 200

@user_settings_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.json
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    user_id = session.get('user_id')
    user = db.session.get(User, user_id)

    if not user or not check_password_hash(user.password, current_password):
        return jsonify({"message": "Incorrect current password"}), 401

    user.password = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200

@user_settings_bp.route('/delete-account', methods=['POST'])
@login_required
def delete_account():
    data = request.json
    current_password = data.get('password')
    user_id = session.get('user_id')
    user = db.session.get(User, user_id)

    if not user or not check_password_hash(user.password, current_password):
        return jsonify({"message": "Incorrect current password"}), 401

    user.active = False
    db.session.commit()
    session.clear()
    return jsonify({"message": "Account deactivated successfully"}), 200
