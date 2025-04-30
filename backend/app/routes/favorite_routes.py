from flask import Blueprint, request, jsonify, session
from app import db
from app.models.favorite import Favorite
from app.schemas.favorite_schema import favorite_schema, favorites_schema
from app.utils.decorators import login_required
from flask_cors import cross_origin


favorite_bp = Blueprint('favorite_bp', __name__, url_prefix='/api/favorites')

@favorite_bp.route('/character/<int:character_id>', methods=['OPTIONS'])
@cross_origin(supports_credentials=True)
def options_favorites2():
    return '', 200

@favorite_bp.route('/', methods=['GET'])
@login_required
def get_favorites():
    if request.method == 'OPTIONS':
        return '', 200
    user_favorites = Favorite.query.filter_by(user_id=session.get('user_id')).all()
    return jsonify(favorites_schema.dump(user_favorites)), 200

@favorite_bp.route('/', methods=['POST'])
@login_required
def add_favorite():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.json
    character_id = data.get('character_id')
    filter_json = data.get('filter_json')

    if not character_id and not filter_json:
        return jsonify({"error": "Either character_id or filter_json is required."}), 400

    favorite = Favorite(user_id=session.get('user_id'), character_id=character_id, filter_json=filter_json)
    db.session.add(favorite)
    db.session.commit()

    return jsonify(favorite_schema.dump(favorite)), 201

@favorite_bp.route('/character/<int:character_id>', methods=['DELETE'])
@login_required
def delete_favorite_by_character(character_id):
    favorite = Favorite.query.filter_by(
        user_id=session.get('user_id'),
        character_id=character_id
    ).first()

    if not favorite:
        return jsonify({"error": "Favorite not found"}), 404

    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": "Favorite deleted"}), 200
