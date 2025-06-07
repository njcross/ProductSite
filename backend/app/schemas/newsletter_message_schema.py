from marshmallow import Schema, fields

class NewsletterMessageSchema(Schema):
    id = fields.Int(dump_only=True)
    subject = fields.Str(required=True)
    body = fields.Str(required=True)
    newsletter_value = fields.Str(required=True)
    sent_at = fields.DateTime(dump_only=True)

# Single and multiple serializers
newsletter_message_schema = NewsletterMessageSchema()
newsletter_messages_schema = NewsletterMessageSchema(many=True)
