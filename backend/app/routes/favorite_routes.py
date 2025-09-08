from flask import Blueprint, request, jsonify, session
from app.extensions import db
from app.models.favorite import Favorite
from app.schemas.favorite_schema import favorite_schema, favorites_schema
from app.utils.decorators import login_required
from flask_cors import cross_origin


favorite_bp = Blueprint('favorite_bp', __name__, url_prefix='/api/favorites')

@favorite_bp.route('/character/<int:character_id>', methods=['OPTIONS'])
def options_favorites2():
    return '', 200

@favorite_bp.route('/', methods=['GET'])
@login_required
def get_favorites():
    if request.method == 'OPTIONS':
        return '', 200

    q = Favorite.query.filter_by(user_id=session.get('user_id'))
    type_param = request.args.get('type')

    if type_param == 'filter':
        # only saved search filters
        q = q.filter(Favorite.filter_json.isnot(None), Favorite.kit_id.is_(None))
    elif type_param == 'kit':
        # only item/kit favorites
        q = q.filter(Favorite.kit_id.isnot(None))
    # else: return all

    return jsonify(favorites_schema.dump(q.all())), 200


@favorite_bp.route('/', methods=['POST'])
@login_required
def add_favorite():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    # accept both old/new keys
    kit_id = data.get('kit_id') or data.get('character_id')
    filter_json = data.get('filter_json') or data.get('filter_data')
    name = data.get('name')  # optional, if your model has it

    if not kit_id and not filter_json:
        return jsonify({"error": "Either kit_id/character_id or filter_json/filter_data is required."}), 400

    fav = Favorite(
        user_id=session.get('user_id'),
        kit_id=kit_id if kit_id else None,
        filter_json=filter_json if filter_json else None,
    )
    # if your model includes a name column, set it:
    if hasattr(Favorite, 'name'):
        setattr(fav, 'name', name)

    db.session.add(fav)
    db.session.commit()
    return jsonify(favorite_schema.dump(fav)), 201

@favorite_bp.route('/character/<int:character_id>', methods=['DELETE'])
@login_required
def delete_favorite_by_character(character_id):
    favorite = Favorite.query.filter_by(
        user_id=session.get('user_id'),
        kit_id=character_id,
    ).first()

    if not favorite:
        return jsonify({"error": "Favorite not found"}), 404

    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": "Favorite deleted"}), 200

@favorite_bp.route('/<int:fav_id>', methods=['DELETE'])
@login_required
def delete_favorite(fav_id):
    fav = Favorite.query.filter_by(user_id=session.get('user_id'), id=fav_id).first()
    if not fav:
        return jsonify({"error": "Favorite not found"}), 404
    db.session.delete(fav)
    db.session.commit()
    return jsonify({"message": "Favorite deleted"}), 200