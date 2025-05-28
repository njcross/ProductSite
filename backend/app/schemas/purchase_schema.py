from marshmallow import Schema, fields, post_dump
from app.schemas.inventory_schema import InventorySchema
from app.schemas.shipping_address_schema import ShippingAddressSchema

class PurchaseSchema(Schema):
    id = fields.Int()
    kit_id = fields.Int()
    user_id = fields.Int()
    inventory_id = fields.Int()
    shipping_address_id = fields.Int()
    quantity = fields.Int()
    time_bought = fields.DateTime()

    payment_method = fields.Str()
    available_date = fields.Int()
    pick_up_date = fields.Date()
    status = fields.Str()

    # Include nested fields from related models
    kit = fields.Nested('KitSchema', only=['id', 'name', 'image_url', 'price', 'description'], dump_only=True)
    user = fields.Nested('UserSchema', only=['id', 'username'], dump_only=True)
    inventory = fields.Nested(InventorySchema, only=['id', 'location', 'location_name'], dump_only=True)
    shipping_address = fields.Nested(ShippingAddressSchema, only=['id', 'line1', 'city', 'state', 'postal_code', 'country'], dump_only=True)

    total = fields.Method("get_total", dump_only=True)

    def get_total(self, obj):
        return obj.kit.price * obj.quantity if obj.kit and obj.kit.price else None


purchase_schema = PurchaseSchema()
purchases_schema = PurchaseSchema(many=True)