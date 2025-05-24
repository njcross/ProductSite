from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.resource import Resource
from app.schemas.resource_schema import resource_schema, resources_schema
from app.utils.decorators import admin_required

resource_bp = Blueprint('resources', __name__, url_prefix='/api/resources')

@resource_bp.route('', methods=['GET'])
def get_resources():
    resources = Resource.query.all()
    return resources_schema.dump(resources), 200

@resource_bp.route('', methods=['POST'])
@admin_required
def create_resource():
    data = request.get_json()
    errors = resource_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    resource = Resource(**data)
    db.session.add(resource)
    db.session.commit()
    return resource_schema.dump(resource), 201

@resource_bp.route('/<int:resource_id>', methods=['DELETE'])
@admin_required
def delete_resource(resource_id):
    resource = db.session.get(Resource, resource_id)
    if not resource:
        return jsonify({"error": "Resource not found"}), 404

    db.session.delete(resource)
    db.session.commit()
    return '', 204
