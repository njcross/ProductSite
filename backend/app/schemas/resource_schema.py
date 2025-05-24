from marshmallow import Schema, fields

class ResourceSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str(required=True)
    thumbnail_url = fields.Str(required=True)
    file_url = fields.Str(required=True)

resource_schema = ResourceSchema()
resources_schema = ResourceSchema(many=True)
