
from flask import Blueprint, request, jsonify, session
from sqlalchemy import select, or_
from app import db
from app.models.character import Character
from app.schemas.character_schema import character_schema, characters_schema
from app.utils.decorators import login_required

character_bp = Blueprint("characters", __name__, url_prefix="/characters")

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
@login_required
def create_character():
    data = request.get_json()
    try:
        new_character = character_schema.load(data)
        character = Character(**new_character)
        db.session.add(character)
        db.session.commit()
        return character_schema.jsonify(character), 201
    except Exception as e:
        return jsonify({"message": "Error creating character", "error": str(e)}), 400


@character_bp.route("/<int:id>", methods=["PUT"])
@login_required
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
        return character_schema.jsonify(character), 200
    except Exception as e:
        return jsonify({"message": "Error updating character", "error": str(e)}), 400


@character_bp.route("/<int:id>", methods=["DELETE"])
@login_required
def delete_character(id):
    character = db.session.get(Character, id)
    if not character:
        return jsonify({"message": "Character not found"}), 404

    db.session.delete(character)
    db.session.commit()
    return jsonify({"message": "Character deleted"}), 200
