from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash

user_settings_bp = Blueprint('user_settings', __name__, url_prefix='/api')

# Mock user data (in real applications, use your database instead)
mock_user = {
    "email": "admin@example.com",
    "password_hash": generate_password_hash("admin123")  # hashed "admin123"
}

@user_settings_bp.route('/change-email', methods=['POST'])
def change_email():
    data = request.json
    new_email = data.get('email')
    password = data.get('password')

    if not check_password_hash(mock_user['password_hash'], password):
        return jsonify({"message": "Incorrect password"}), 401

    mock_user['email'] = new_email
    return jsonify({"message": "Email updated successfully"}), 200

@user_settings_bp.route('/change-password', methods=['POST'])
def change_password():
    data = request.json
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not check_password_hash(mock_user['password_hash'], current_password):
        return jsonify({"message": "Incorrect current password"}), 401

    mock_user['password_hash'] = generate_password_hash(new_password)
    return jsonify({"message": "Password updated successfully"}), 200
