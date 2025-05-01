from marshmallow import Schema, fields, validate

class ReviewSchema(Schema):
    id = fields.Int(dump_only=True)
    kit_id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    comment = fields.Str()
    user = fields.Nested("UserSchema", only=("id", "username"))

review_schema = ReviewSchema()
reviews_schema = ReviewSchema(many=True)