from marshmallow import Schema, fields

class FavoriteSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    kit_id = fields.Int(allow_none=True)
    filter_json = fields.Str(allow_none=True)
    filter_name = fields.Str(allow_none=True)

favorite_schema = FavoriteSchema()
favorites_schema = FavoriteSchema(many=True)