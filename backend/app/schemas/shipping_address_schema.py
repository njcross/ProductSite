from marshmallow import Schema, fields, post_load
from app.models.shipping_address import ShippingAddress

class ShippingAddressSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)

    line1 = fields.Str(required=True)
    city = fields.Str(required=True)
    state = fields.Str(required=True)
    postal_code = fields.Str(required=True)
    country = fields.Str(required=True)

    @post_load
    def make_shipping_address(self, data, **kwargs):
        return ShippingAddress(**data)

shipping_address_schema = ShippingAddressSchema()
shipping_addresses_schema = ShippingAddressSchema(many=True)