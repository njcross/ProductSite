from marshmallow import Schema, fields

class PurchaseSchema(Schema):
    id = fields.Int()
    kit_id = fields.Int()
    user_id = fields.Int()
    quantity = fields.Int()
    time_bought = fields.DateTime()
    kit = fields.Nested('KitSchema', only=['id', 'name'])
    user = fields.Nested('UserSchema', only=['id', 'username'])

purchase_schema = PurchaseSchema()
purchases_schema = PurchaseSchema(many=True)