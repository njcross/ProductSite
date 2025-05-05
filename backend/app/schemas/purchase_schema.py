from marshmallow import Schema, fields
from app.schemas.inventory_schema import InventorySchema

class PurchaseSchema(Schema):
    id = fields.Int()
    kit_id = fields.Int()
    user_id = fields.Int()
    inventory_id = fields.Int()
    quantity = fields.Int()
    time_bought = fields.DateTime()

    kit = fields.Nested('KitSchema', only=['id', 'name', 'image_url', 'price'], dump_only=True)
    user = fields.Nested('UserSchema', only=['id', 'username'], dump_only=True)
    inventory = fields.Nested(InventorySchema, only=['id', 'location', 'location_name'], dump_only=True)

purchase_schema = PurchaseSchema()
purchases_schema = PurchaseSchema(many=True)