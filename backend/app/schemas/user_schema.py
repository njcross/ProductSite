from marshmallow import Schema, fields

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(load_only=True, required=True)
    role = fields.Str(required=True)
    active = fields.Bool(dump_only=True)

user_schema = UserSchema()
users_schema = UserSchema(many=True)