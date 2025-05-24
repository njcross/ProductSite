# app/routes/newsletter_routes.py
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.newsletter import Newsletter
from app.utils.decorators import admin_required
from app.utils.email import send_bulk_email


newsletter_bp = Blueprint('newsletter', __name__, url_prefix='/api/newsletter')

@newsletter_bp.route('/subscribe', methods=['POST', 'OPTIONS'])
def subscribe():
    if request.method == 'OPTIONS':
        return '', 200  # Respond to preflight properly

    data = request.get_json()
    email = data.get('email')
    value = data.get('newsletter_value')

    if not email or not value:
        return jsonify({'error': 'Email and newsletter_value are required.'}), 400

    if Newsletter.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already subscribed.'}), 400

    new_entry = Newsletter(email=email, newsletter_value=value)
    db.session.add(new_entry)
    db.session.commit()
    return jsonify({'message': 'Subscribed successfully'}), 201


@newsletter_bp.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    data = request.get_json()
    email = data.get('email')

    entry = Newsletter.query.filter_by(email=email).first()
    if not entry:
        return jsonify({'error': 'Email not found.'}), 404

    db.session.delete(entry)
    db.session.commit()
    return jsonify({'message': 'Unsubscribed successfully'}), 200

@newsletter_bp.route('/list', methods=['GET'])
@admin_required
def list_by_value():
    value = request.args.get('value')
    if not value:
        return jsonify({'error': 'Missing newsletter_value parameter.'}), 400

    emails = Newsletter.query.filter_by(newsletter_value=value).all()
    return jsonify([entry.email for entry in emails]), 200

@newsletter_bp.route('/send', methods=['POST'])
@admin_required
def send_newsletter():
    data = request.get_json()
    subject = data.get('subject')
    body = data.get('body')
    emails = data.get('emails')

    if not subject or not body or not emails:
        return jsonify({'error': 'Missing subject, body, or email list.'}), 400

    success, msg = send_bulk_email(subject, body, emails)
    if success:
        return jsonify({'message': msg}), 200
    else:
        return jsonify({'error': msg}), 500

