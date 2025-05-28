from marshmallow import Schema, fields, post_load
from app.models.inventory import Inventory
from app.schemas.kit_schema import KitSchema

class InventorySchema(Schema):
    id = fields.Int(dump_only=True)
    location = fields.Str(required=True)
    coordinates = fields.Str(required=False)
    location_name = fields.Str(required=True)
    quantity = fields.Int(required=True)
    kit_id = fields.Int(required=True, load_only=True)

    kit = fields.Nested(KitSchema, only=["id", "name", "image_url", "price", "description"], dump_only=True)

    @post_load
    def make_inventory(self, data, **kwargs):
        return Inventory(**data)

inventory_schema = InventorySchema()
inventories_schema = InventorySchema(many=True)
