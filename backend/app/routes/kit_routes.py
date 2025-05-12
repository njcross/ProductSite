from flask import Blueprint, request, jsonify
from sqlalchemy import select, or_, and_
from app.extensions import db
from app.models.kits import Kit, age_options, category_options, kit_age, kit_category, kit_inventory
from app.schemas.kit_schema import kit_schema, kits_schema
from app.models.inventory import Inventory
from app.utils.decorators import admin_required
from flask_cors import cross_origin
from sqlalchemy.orm import joinedload

kit_bp = Blueprint("kits", __name__, url_prefix="/api/kits")


@kit_bp.route('/by-ids/', methods=['POST', 'OPTIONS'])
def get_kits_by_ids():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    ids = data.get('ids', [])

    if not isinstance(ids, list) or not all(isinstance(i, int) for i in ids):
        return jsonify({"error": "Invalid or missing 'ids' list"}), 400

    kits = Kit.query.filter(Kit.id.in_(ids)).all()
    return jsonify(kits_schema.dump(kits)), 200


@kit_bp.route("", methods=["GET", "OPTIONS"])
def get_kits():
    if request.method == 'OPTIONS':
        return '', 200
    sort_by = request.args.get("sortBy", "name")
    search = request.args.get("search", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("perPage", 12))
    min_rating = request.args.get("min_rating", type=float) 

    # Expect comma-separated lists for age/category
    age_ids = request.args.get("age_ids")
    category_ids = request.args.get("category_ids")
    locations = request.args.get("locations")

    query = select(Kit).options(joinedload(Kit.age), joinedload(Kit.category), joinedload(Kit.inventories))

    filters = []

    if search:
        like_term = f"%{search}%"
        filters.append(or_(
            Kit.name.ilike(like_term),
            Kit.description.ilike(like_term),
            Inventory.location.ilike(like_term)
        ))
        query = query.join(kit_inventory)

    if age_ids:
        age_id_list = [int(i) for i in age_ids.split(",") if i.isdigit()]
        query = query.join(kit_age).filter(kit_age.c.age_id.in_(age_id_list))

    if category_ids:
        category_id_list = [int(i) for i in category_ids.split(",") if i.isdigit()]
        query = query.join(kit_category).filter(kit_category.c.category_id.in_(category_id_list))

    if filters:
        query = query.where(and_(*filters))

    kits = db.session.execute(query).unique().scalars().all()
    if min_rating is not None:
        kits = [kit for kit in kits if (kit.average_rating or 0) >= min_rating]

    query = query.order_by(getattr(Kit, sort_by, Kit.name))

    all_kits = db.session.execute(query).unique().scalars().all()
    start = (page - 1) * per_page
    end = start + per_page

    return jsonify(kits_schema.dump(all_kits[start:end])), 200


@kit_bp.route("/<int:id>", methods=["GET"])
def get_kit(id):
    kit = db.session.query(Kit).options(
        joinedload(Kit.age),
        joinedload(Kit.category)
    ).get(id)
    if not kit:
        return jsonify({"message": "Kit not found"}), 404

    return jsonify(kit_schema.dump(kit)), 200


@kit_bp.route("", methods=["POST"])
@admin_required
def create_kit():
    data = request.get_json()
    try:
        kit_data = kit_schema.load(data)
        new_kit = Kit(**kit_data)
        db.session.add(new_kit)
        db.session.commit()
        return jsonify(kit_schema.dump(new_kit)), 201
    except Exception as e:
        return jsonify({"message": "Error creating kit", "error": str(e)}), 400


@kit_bp.route("/<int:id>", methods=["PUT"])
@admin_required
def update_kit(id):
    kit = db.session.get(Kit, id)
    if not kit:
        return jsonify({"message": "Kit not found"}), 404

    data = request.get_json()

    # Remove fields that kit_schema.load() can't handle
    loadable_data = {
        key: value for key, value in data.items()
        if key not in ['age', 'ages', 'category', 'categories', 'id', 'age_ids', 'category_ids']
    }

    try:
        updates = kit_schema.load(loadable_data)

        # Apply simple field updates
        for key, value in updates.items():
            setattr(kit, key, value)

        # Handle relationship updates manually
        if 'age_ids' in data:
            kit.age = db.session.query(age_options).filter(
                age_options.id.in_(data['age_ids'])
            ).all()

        if 'category_ids' in data:
            kit.category = db.session.query(category_options).filter(
                category_options.id.in_(data['category_ids'])
            ).all()

        db.session.commit()
        return jsonify(kit_schema.dump(kit)), 200

    except Exception as e:
        return jsonify({"message": "Error updating kit", "error": str(e)}), 400




@kit_bp.route("/<int:id>", methods=["DELETE"])
@admin_required
def delete_kit(id):
    kit = db.session.get(Kit, id)
    if not kit:
        return jsonify({"message": "Kit not found"}), 404

    db.session.delete(kit)
    db.session.commit()
    return jsonify({"message": "Kit deleted"}), 200


@kit_bp.route("/age-options", methods=["GET"])
def get_age_options():
    ages = age_options.query.all()
    return jsonify([{"id": a.id, "name": a.name} for a in ages]), 200


@kit_bp.route("/category-options", methods=["GET"])
def get_category_options():
    categories = category_options.query.all()
    return jsonify([{"id": c.id, "name": c.name} for c in categories]), 200

@kit_bp.route("/age-options", methods=["POST", "OPTIONS"])
def create_age_option():
    data = request.get_json()
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    if age_options.query.filter_by(name=name).first():
        return jsonify({"error": "Age option already exists"}), 400

    new_age = age_options(name=name)
    db.session.add(new_age)
    db.session.commit()
    return jsonify({"id": new_age.id, "name": new_age.name}), 201

@kit_bp.route("/age-options/<int:id>", methods=["DELETE"])
def delete_age_option(id):
    age = age_options.query.get(id)
    if not age:
        return jsonify({"error": "Age option not found"}), 404

    db.session.delete(age)
    db.session.commit()
    return jsonify({"message": "Age option deleted"}), 200


@kit_bp.route("/category-options", methods=["POST", "OPTIONS"])
def create_category_option():
    data = request.get_json()
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    if category_options.query.filter_by(name=name).first():
        return jsonify({"error": "Category option already exists"}), 400

    new_category = category_options(name=name)
    db.session.add(new_category)
    db.session.commit()
    return jsonify({"id": new_category.id, "name": new_category.name}), 201

@kit_bp.route("/category-options/<int:id>", methods=["DELETE"])
def delete_category_option(id):
    category = category_options.query.get(id)
    if not category:
        return jsonify({"error": "Category option not found"}), 404

    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category option deleted"}), 200
