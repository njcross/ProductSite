from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.favorite import Favorite
from app.schemas.favorite_schema import favorite_schema, favorites_schema

favorite_bp = Blueprint('favorite_bp', __name__, url_prefix='/api/favorites')

@favorite_bp.route('/', methods=['GET'])
@login_required
def get_favorites():
    user_favorites = Favorite.query.filter_by(user_id=current_user.id).all()
    return favorites_schema.jsonify(user_favorites), 200

@favorite_bp.route('/', methods=['POST'])
@login_required
def add_favorite():
    data = request.json
    character_id = data.get('character_id')
    filter_json = data.get('filter_json')

    if not character_id and not filter_json:
        return jsonify({"error": "Either character_id or filter_json is required."}), 400

    favorite = Favorite(user_id=current_user.id, character_id=character_id, filter_json=filter_json)
    db.session.add(favorite)
    db.session.commit()

    return favorite_schema.jsonify(favorite), 201

@favorite_bp.route('/<int:favorite_id>', methods=['DELETE'])
@login_required
def delete_favorite(favorite_id):
    favorite = Favorite.query.get_or_404(favorite_id)
    if favorite.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": "Favorite deleted"}), 200