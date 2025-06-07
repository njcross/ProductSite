from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.newsletter_message import NewsletterMessage
from app.schemas.newsletter_message_schema import (
    newsletter_message_schema,
    newsletter_messages_schema
)
from app.utils.decorators import admin_required
from datetime import datetime

newsletter_message_bp = Blueprint("newsletter_message", __name__, url_prefix="/api/newsletter-messages")


# GET all newsletter messages
@newsletter_message_bp.route("/", methods=["GET"])
@admin_required
def get_all_messages():
    messages = NewsletterMessage.query.order_by(NewsletterMessage.sent_at.desc()).all()
    return jsonify(newsletter_messages_schema.dump(messages))


# GET a single message by ID
@newsletter_message_bp.route("/<int:message_id>", methods=["GET"])
@admin_required
def get_message(message_id):
    message = NewsletterMessage.query.get_or_404(message_id)
    return jsonify(newsletter_message_schema.dump(message))


# CREATE a new newsletter message
@newsletter_message_bp.route("/", methods=["POST"])
@admin_required
def create_message():
    data = request.get_json()
    errors = newsletter_message_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    new_message = NewsletterMessage(
        subject=data["subject"],
        body=data["body"],
        newsletter_value=data["newsletter_value"],
        sent_at=datetime.utcnow()
    )
    db.session.add(new_message)
    db.session.commit()
    return jsonify(newsletter_message_schema.dump(new_message)), 201


# UPDATE an existing newsletter message
@newsletter_message_bp.route("/<int:message_id>", methods=["PUT"])
@admin_required
def update_message(message_id):
    message = NewsletterMessage.query.get_or_404(message_id)
    data = request.get_json()

    if "subject" in data:
        message.subject = data["subject"]
    if "body" in data:
        message.body = data["body"]
    if "newsletter_value" in data:
        message.newsletter_value = data["newsletter_value"]

    db.session.commit()
    return jsonify(newsletter_message_schema.dump(message))


# DELETE a message
@newsletter_message_bp.route("/<int:message_id>", methods=["DELETE"])
@admin_required
def delete_message(message_id):
    message = NewsletterMessage.query.get_or_404(message_id)
    db.session.delete(message)
    db.session.commit()
    return jsonify({"message": "Newsletter message deleted."}), 200
