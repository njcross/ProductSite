from marshmallow import Schema, fields, validate

class AgeOptionSchema(Schema):
    id = fields.Int()
    name = fields.Str()

class ReviewSchema(Schema):
    id = fields.Int(dump_only=True)
    kit_id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    comment = fields.Str()
    length_of_play = fields.Str(
        validate=validate.OneOf(["<15 mins", "15-30 mins", "30-45 mins", "45+ mins"])
    )
    age = fields.Nested(AgeOptionSchema, many=True)
    user = fields.Nested("UserSchema", only=("id", "username"))

review_schema = ReviewSchema()
reviews_schema = ReviewSchema(many=True)
