from flask import Blueprint, request, jsonify
from sqlalchemy import select, or_, and_
from app.extensions import db
from app.models.kits import Kit, age_options, category_options, kit_age, kit_category, kit_inventory, kit_grade, kit_theme, theme_options, grade_options
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
    sort_dir = request.args.get("sortDir", "asc")
    search = request.args.get("search", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("perPage", 12))
    min_rating = request.args.get("min_rating", type=float) 

    # Expect comma-separated lists for age/category
    age_ids = request.args.get("age_ids")
    category_ids = request.args.get("category_ids")
    grade_ids = request.args.get("grade_ids")
    theme_ids = request.args.get("theme_ids")
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

    if grade_ids:
        grade_id_list = [int(i) for i in grade_ids.split(",") if i.isdigit()]
        query = query.join(kit_grade).filter(kit_grade.c.grade_id.in_(grade_id_list))

    if theme_ids:
        theme_id_list = [int(i) for i in theme_ids.split(",") if i.isdigit()]
        query = query.join(kit_theme).filter(kit_theme.c.theme_id.in_(theme_id_list))
    
    price_range = request.args.get("price_range")
    if price_range:
        try:
            min_price, max_price = map(float, price_range.split('_'))
            filters.append(and_(Kit.price >= min_price, Kit.price <= max_price))
        except ValueError:
            return jsonify({"error": "Invalid price range format. Expected 'min_max'."}), 400


    if filters:
        query = query.where(and_(*filters))
        

    kits = db.session.execute(query).unique().scalars().all()
    if min_rating is not None:
        kits = [kit for kit in kits if (kit.average_rating or 0) >= min_rating]
    if locations:
        location_list = [loc.strip() for loc in locations.split(",") if loc.strip()]
        kits = [kit for kit in kits if any(loc in inv.location_name for loc in location_list for inv in kit.inventories)]

    sort_column = getattr(Kit, sort_by, Kit.name)
    if sort_dir == "desc":
        sort_column = sort_column.desc()
    else:
        sort_column = sort_column.asc()

    query = query.order_by(sort_column)

    all_kits = db.session.execute(query).unique().scalars().all()
    start = (page - 1) * per_page
    end = start + per_page

    return jsonify(kits_schema.dump(all_kits[start:end])), 200


@kit_bp.route("/<int:id>", methods=["GET"])
def get_kit(id):
    kit = db.session.query(Kit).options(
        joinedload(Kit.age),
        joinedload(Kit.category),
        joinedload(Kit.grade),
        joinedload(Kit.theme)
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
        
        if 'grade_ids' in data:
            kit.grade = db.session.query(grade_options).filter(
                grade_options.id.in_(data['grade_ids'])
            ).all()

        if 'theme_ids' in data:
            kit.theme = db.session.query(theme_options).filter(
                theme_options.id.in_(data['theme_ids'])
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

@kit_bp.route("/grade-options", methods=["GET"])
def get_grade_options():
    grades = grade_options.query.all()
    return jsonify([{"id": g.id, "name": g.name} for g in grades]), 200 

@kit_bp.route("/theme-options", methods=["GET"])
def get_theme_options():
    themes = theme_options.query.all()
    return jsonify([{"id": t.id, "name": t.name} for t in themes]), 200

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

@kit_bp.route("/grade-options", methods=["POST", "OPTIONS"])
def create_grade_option():
    data = request.get_json()
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    if grade_options.query.filter_by(name=name).first():
        return jsonify({"error": "Grade option already exists"}), 400

    new_grade = grade_options(name=name)
    db.session.add(new_grade)
    db.session.commit()
    return jsonify({"id": new_grade.id, "name": new_grade.name}), 201

@kit_bp.route("/grade-options/<int:id>", methods=["DELETE"])
def delete_grade_option(id):
    grade = grade_options.query.get(id)
    if not grade:
        return jsonify({"error": "Grade option not found"}), 404

    db.session.delete(grade)
    db.session.commit()
    return jsonify({"message": "Grade option deleted"}), 200

@kit_bp.route("/theme-options", methods=["POST", "OPTIONS"])
def create_theme_option():
    data = request.get_json()
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    if theme_options.query.filter_by(name=name).first():
        return jsonify({"error": "Theme option already exists"}), 400

    new_theme = theme_options(name=name)
    db.session.add(new_theme)
    db.session.commit()
    return jsonify({"id": new_theme.id, "name": new_theme.name}), 201

@kit_bp.route("/theme-options/<int:id>", methods=["DELETE"])
def delete_theme_option(id):
    theme = theme_options.query.get(id)
    if not theme:
        return jsonify({"error": "Theme option not found"}), 404

    db.session.delete(theme)
    db.session.commit()
    return jsonify({"message": "Theme option deleted"}), 200
