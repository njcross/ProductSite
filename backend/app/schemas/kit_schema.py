from marshmallow import Schema, fields, post_load, ValidationError, EXCLUDE
from app.models.kits import Kit, age_options, category_options, grade_options, theme_options
from app.extensions import db

class AgeSchema(Schema):
    id = fields.Int()
    name = fields.Str()

class CategorySchema(Schema):
    id = fields.Int()
    name = fields.Str()
    
class GradeSchema(Schema):
    id = fields.Int()
    name = fields.Str()

class ThemeSchema(Schema):
    id = fields.Int()
    name = fields.Str()

class InventorySchema(Schema):
    id = fields.Int()
    location = fields.Str()         # format: "lat,lng"
    location_name = fields.Str()
    quantity = fields.Int()

class KitSchema(Schema):
    class Meta:
        unknown = EXCLUDE
    
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    image_url = fields.Str(required=True)
    price = fields.Float(required=True)
    description = fields.Str(required=True)

    age_ids = fields.List(fields.Int(), load_only=True)
    category_ids = fields.List(fields.Int(), load_only=True)
    grade_ids = fields.List(fields.Int(), load_only=True)          
    theme_ids = fields.List(fields.Int(), load_only=True)           
    inventory_input =  fields.List(fields.Dict(), load_only=True, data_key='inventories')      

    age = fields.List(fields.Nested(AgeSchema), dump_only=True)
    category = fields.List(fields.Nested(CategorySchema), dump_only=True)
    grade = fields.List(fields.Nested(GradeSchema), dump_only=True)
    theme = fields.List(fields.Nested(ThemeSchema), dump_only=True)
    average_rating = fields.Float(dump_only=True)
    review_count = fields.Int(dump_only=True)

    inventory_output = fields.List(fields.Nested(InventorySchema), dump_only=True, attribute='inventories')


    @post_load
    def load_relationships(self, data, **kwargs):
        if 'age_ids' in data:
            data['age'] = age_options.query.filter(age_options.id.in_(data['age_ids'])).all()
            del data['age_ids']
        if 'category_ids' in data:
            data['category'] = category_options.query.filter(category_options.id.in_(data['category_ids'])).all()
            del data['category_ids']
        if 'grade_ids' in data:
            data['grade'] = grade_options.query.filter(grade_options.id.in_(data['grade_ids'])).all()
            del data['grade_ids']
        if 'theme_ids' in data:
            data['theme'] = theme_options.query.filter(theme_options.id.in_(data['theme_ids'])).all()
            del data['theme_ids']
        return data

kit_schema = KitSchema()
kits_schema = KitSchema(many=True)
age_schema = AgeSchema()
ages_schema = AgeSchema(many=True)
category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)
grade_schema = GradeSchema()
grades_schema = GradeSchema(many=True)
theme_schema = ThemeSchema()
themes_schema = ThemeSchema(many=True)