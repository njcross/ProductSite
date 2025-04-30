from marshmallow import Schema, fields

class NewsletterSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    newsletter_value = fields.Str(required=True)

# Single + multiple object serializers
newsletter_schema = NewsletterSchema()
newsletters_schema = NewsletterSchema(many=True)