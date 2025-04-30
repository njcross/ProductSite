
from flask import Blueprint, request, jsonify, session
from sqlalchemy import select, or_
from app import db
from app.models.character import Character
from app.schemas.character_schema import character_schema, characters_schema
from app.utils.decorators import login_required
from app.utils.decorators import admin_required
from flask_cors import cross_origin

character_bp = Blueprint("characters", __name__, url_prefix="/api/characters")


@character_bp.route('/by-ids/', methods=['OPTIONS'])
@cross_origin(supports_credentials=True)
def options_favorites():
    return '', 200

@character_bp.route('', methods=['OPTIONS'])
@cross_origin(supports_credentials=True)
def options_favorites2():
    return '', 200

@character_bp.route('/by-ids/', methods=['POST'])
def get_characters_by_ids():
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight success"}), 200

    data = request.get_json()
    ids = data.get('ids', [])

    if not isinstance(ids, list) or not all(isinstance(i, int) for i in ids):
        return jsonify({"error": "Invalid or missing 'ids' list"}), 400

    characters = Character.query.filter(Character.id.in_(ids)).all()
    return jsonify(characters_schema.dump(characters)), 200

@character_bp.route("", methods=["GET"])
def get_characters():
    sort_by = request.args.get("sortBy", "name")
    search = request.args.get("search", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("perPage", 12))
    query = select(Character)

    if search:
        like_term = f"%{search}%"
        query = query.where(
            or_(
                Character.name.ilike(like_term),
                Character.alias.ilike(like_term),
                Character.alignment.ilike(like_term),
                Character.powers.ilike(like_term),
            )
        )
    query = query.order_by(getattr(Character, sort_by, Character.name))
    characters = db.session.execute(query).scalars().all()
    start = (page - 1) * per_page
    end = start + per_page

    return jsonify(characters_schema.dump(characters[start:end])), 200


@character_bp.route("/<int:id>", methods=["GET"])
def get_character(id):
    character = db.session.get(Character, id)
    if not character:
        return jsonify({"message": "Character not found"}), 404
    return jsonify(character_schema.dump(character)), 200


@character_bp.route("", methods=["POST"])
@admin_required
def create_character():
    data = request.get_json()
    try:
        new_character = character_schema.load(data)
        character = Character(**new_character)
        db.session.add(character)
        db.session.commit()
        return jsonify(character_schema.dump(character)), 201
    except Exception as e:
        return jsonify({"message": "Error creating character", "error": str(e)}), 400


@character_bp.route("/<int:id>", methods=["PUT"])
@admin_required
def update_character(id):
    character = db.session.get(Character, id)
    if not character:
        return jsonify({"message": "Character not found"}), 404

    data = request.get_json()
    try:
        updates = character_schema.load(data)
        for key, value in updates.items():
            setattr(character, key, value)
        db.session.commit()
        return jsonify(character_schema.dump(character)), 200
    except Exception as e:
        return jsonify({"message": "Error updating character", "error": str(e)}), 400


@character_bp.route("/<int:id>", methods=["DELETE"])
@admin_required
def delete_character(id):
    character = db.session.get(Character, id)
    if not character:
        return jsonify({"message": "Character not found"}), 404

    db.session.delete(character)
    db.session.commit()
    return jsonify({"message": "Character deleted"}), 200
