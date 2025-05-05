from marshmallow import Schema, fields, post_load, ValidationError
from app.models.kits import Kit, age_options, category_options
from app.extensions import db

class AgeSchema(Schema):
    id = fields.Int()
    name = fields.Str()

class CategorySchema(Schema):
    id = fields.Int()
    name = fields.Str()

class InventorySchema(Schema):
    id = fields.Int()
    location = fields.Str()         # format: "lat,lng"
    location_name = fields.Str()
    quantity = fields.Int()

class KitSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    image_url = fields.Str(required=True)
    price = fields.Float(required=True)
    description = fields.Str(required=True)

    age_ids = fields.List(fields.Int(), load_only=True)
    category_ids = fields.List(fields.Int(), load_only=True)

    age = fields.List(fields.Nested(AgeSchema), dump_only=True)
    category = fields.List(fields.Nested(CategorySchema), dump_only=True)
    average_rating = fields.Float(dump_only=True)
    review_count = fields.Int(dump_only=True)

    inventories = fields.List(fields.Nested(InventorySchema), dump_only=True)


    @post_load
    def load_relationships(self, data, **kwargs):
        if 'age_ids' in data:
            data['age'] = age_options.query.filter(age_options.id.in_(data['age_ids'])).all()
            del data['age_ids']
        if 'category_ids' in data:
            data['category'] = category_options.query.filter(category_options.id.in_(data['category_ids'])).all()
            del data['category_ids']
        return data

kit_schema = KitSchema()
kits_schema = KitSchema(many=True)
age_schema = AgeSchema()
ages_schema = AgeSchema(many=True)
category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)