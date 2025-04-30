from marshmallow import Schema, fields
from app.schemas.kit_schema import KitSchema

class CartSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    kit_id = fields.Int(required=True)
    quantity = fields.Int(required=True)
    character = fields.Nested(KitSchema, dump_only=True)

cart_schema = CartSchema()
carts_schema = CartSchema(many=True)