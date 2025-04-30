from marshmallow import Schema, fields

class CharacterSchema(Schema):
    id = fields.Int()
    name = fields.Str(required=True)
    alias = fields.Str(required=True)
    alignment = fields.Str(required=True)
    powers = fields.Str(required=True)
    image_url = fields.Str(required=True)
    price = fields.Float(required=True)

character_schema = CharacterSchema()
characters_schema = CharacterSchema(many=True)