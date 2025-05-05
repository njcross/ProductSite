from marshmallow import Schema, fields
from app.schemas.kit_schema import KitSchema
from app.schemas.inventory_schema import InventorySchema

class CartSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    kit_id = fields.Int(required=True)
    inventory_id = fields.Int(allow_none=True)
    quantity = fields.Int(required=True)
    kit = fields.Nested('KitSchema', dump_only=True)
    inventory = fields.Nested(InventorySchema, dump_only=True)

cart_schema = CartSchema()
carts_schema = CartSchema(many=True)