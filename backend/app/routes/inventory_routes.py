from flask import Blueprint, json, request, jsonify, session
from app.models import Inventory
from app.utils.decorators import login_required, admin_required 
from app.extensions import db
from sqlalchemy.orm import joinedload
from app.schemas.kit_schema import kit_schema
from app.schemas.inventory_schema import inventories_schema, inventory_schema
from app.models.kits import Kit
import requests
import os
import redis
from datetime import timedelta

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
inventory_bp = Blueprint('inventory', __name__, url_prefix="/api/inventory")
def find_address(input_text):
    
    url = (
        'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
        f'?input={input_text}&inputtype=textquery&fields=formatted_address,geometry'
        f'&key={GOOGLE_API_KEY}'
    )

    try:
        res = requests.get(url)
        res_data = res.json()

        if res_data.get('status') != 'OK' or not res_data.get('candidates'):
            return jsonify({'error': 'Place not found'}), 404

        place = res_data['candidates'][0]
        return {
            'address': place['formatted_address'],
            'lat': place['geometry']['location']['lat'],
            'lng': place['geometry']['location']['lng'],
        }

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@inventory_bp.route('', methods=['POST'])
@admin_required
def create_inventory():
    data = request.json
    location_name = data.get('location_name', '').lower()
    if location_name == 'warehouse':
        data['coordinates'] = ''
        data['location'] = ''
    else:
        rtn = data['location']
        if not data.get("no_address_lookup"):
            rtn = find_address(data['location'])
            if isinstance(rtn, tuple):  # (Response, status_code)
                return rtn
            if isinstance(rtn, dict):
                data['coordinates'] = f"{rtn['lat']}, {rtn['lng']}"
                data['location'] = rtn['address']
            else:
                data['coordinates'] = "0,0"
                data['location'] = data['location']
        else:
            data['coordinates'] = "0,0"
            del data['no_address_lookup']

    inv = Inventory(**data)
    db.session.add(inv)
    db.session.commit()
    return jsonify({'message': 'Inventory created', 'inventory': inv.id}), 201

@inventory_bp.route('', methods=['PUT'])
@admin_required
def edit_inventory():
    data = request.get_json(force=True)
    original_kit_id = data['original_kit_id']
    original_location_name = data['original_location_name']

    inv = Inventory.query.filter_by(kit_id=original_kit_id, location_name=original_location_name).first()
    if not inv:
        return jsonify({'error': 'Inventory not found'}), 404

    # Update fields
    inv.kit_id = data.get('kit_id', inv.kit_id)
    inv.location_name = data.get('location_name', inv.location_name)
    inv.quantity = data.get('quantity', inv.quantity)

    new_location = data.get('location', inv.location)

    location_name = (data.get('location_name') or '').lower()
    if location_name == 'warehouse':
        inv.coordinates = ''
        inv.location = ''
    else:
        if not data.get("no_address_lookup"):
            rtn = find_address(new_location)
            if isinstance(rtn, tuple):
                return rtn
            if isinstance(rtn, dict):
                inv.coordinates = f"{rtn['lat']}, {rtn['lng']}"
                inv.location = rtn['address']
            else:
                inv.coordinates = "0,0"
                inv.location = new_location
        else:
            inv.coordinates = "0,0"
            inv.location = new_location

    db.session.commit()
    return jsonify({'inventory': inv.id}), 200

@inventory_bp.route('', methods=['DELETE'])
@admin_required
def delete_inventory():
    kit_id = request.args.get('kit_id')
    location = request.args.get('location')
    inv = Inventory.query.filter_by(kit_id=kit_id, location=location).first()
    if not inv:
        return jsonify({'error': 'Inventory not found'}), 404
    db.session.delete(inv)
    db.session.commit()
    return jsonify({'message': 'Inventory deleted'})

@inventory_bp.route('/decrement', methods=['POST'])
@login_required
def decrement_quantity():
    data = request.json
    location_name = data.get('location_name', '').lower()
    quantity = data.get('quantity', 1)
    kit_id = data.get('kit_id')
    if location_name == 'warehouse':
        inv = Inventory.query.filter_by(location_name='warehouse').first()
    else:
        location = data.get('location')
        if not kit_id or not location:
            return jsonify({'error': 'Missing kit_id or location'}), 400
        inv = Inventory.query.filter_by(kit_id=kit_id, location=location).first()
    if not inv or inv.quantity <= 0:
        return jsonify({'error': 'Insufficient inventory'}), 400
    inv.quantity = inv.quantity - quantity
    db.session.commit()
    # Connect to Redis (configure as needed)
    r = redis.Redis(host='localhost', port=6379, db=0)

    # Compose a unique pending key, e.g. based on inventory ID
    user_id = session.get('user_id')
    pending_key = f"pending_inventory:{inv.id}:{user_id}"

    # Save rollback info (can be just inventory_id and quantity for rollback)
    r.setex(
        name=pending_key,
        time=timedelta(minutes=30),  # expires in 30 minutes
        value=json.dumps({
            "inventory_id": inv.id,
            "kit_id": kit_id,
            "quantity": quantity
        })
    )
    return jsonify({'message': 'Inventory decremented', 'new_quantity': inv.quantity})

@inventory_bp.route('/increment', methods=['POST'])
@login_required
def increment_quantity():
    data = request.get_json()
    kit_id = data.get('kit_id')
    location = data.get('location')
    quantity = data.get('quantity', 1)

    if kit_id is None or location is None:
        return jsonify({'error': 'Missing kit_id or location'}), 400

    inv = Inventory.query.filter_by(kit_id=kit_id, location=location).first()
    if not inv:
        return jsonify({'error': 'Inventory record not found'}), 404

    inv.quantity = inv.quantity + quantity
    db.session.commit()

    return jsonify({'message': 'Inventory incremented', 'new_quantity': inv.quantity})


@inventory_bp.route('/<int:kit_id>', methods=['GET'])
def get_inventory_by_kit(kit_id):
    inventories = Inventory.query.options(joinedload(Inventory.kit)).filter_by(kit_id=kit_id).all()
    
    return jsonify(inventories_schema.dump(inventories))


@inventory_bp.route("", methods=["GET"])
def get_inventory():
    sort_by = request.args.get("sortBy", "location_name")
    sort_dir = request.args.get("sortDir", "asc")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("perPage", 10))
    rating = request.args.get("rating", type=float)
    locations = request.args.get("locations")

    query = db.session.query(Inventory).join(Inventory.kit).options(joinedload(Inventory.kit))

    if rating is not None:
        query = query.filter((Kit.average_rating >= rating) | (Kit.average_rating == None))

    if locations:
        loc_list = [l.strip() for l in locations.split(",") if l.strip()]
        query = query.filter(Inventory.location_name.in_(loc_list))

    # Sort safely
    sort_whitelist = {
        "location_name": Inventory.location_name,
        "quantity": Inventory.quantity,
        "location": Inventory.location,
    }
    if sort_by in ['name', 'avg_rating', 'price']:
        sort_column = getattr(Kit, sort_by)
        query = query.join(Inventory.kit)
    else:
        sort_column = getattr(Inventory, sort_by, Inventory.location_name)
    query = query.order_by(sort_column.desc() if sort_dir == "desc" else sort_column.asc())

    # Pagination
    total = query.count()
    results = query.offset((page - 1) * per_page).limit(per_page).all()
    serialized = inventory_schema.dump(results, many=True)

    return jsonify({
        "items": serialized,
        "total": total,
        "page": page,
        "perPage": per_page,
        "hasNext": (page * per_page) < total
    })



@inventory_bp.route('/item/<int:inventory_id>', methods=['GET'])
def get_inventory_by_id(inventory_id):
    inv = Inventory.query.options(joinedload(Inventory.kit)).get(inventory_id)
    if not inv:
        return jsonify({'error': 'Inventory not found'}), 404
    
    return jsonify(inventory_schema.dump(inv))  


# Flask route example
@inventory_bp.route("/locations")
def get_inventory_locations():
    locations = (
        db.session.query(Inventory.location_name, Inventory.location)
        .distinct()
        .all()
    )
    return jsonify([
        {"location_name": loc[0], "location": loc[1]}
        for loc in locations
    ])

@inventory_bp.route('/restore-reserved', methods=['POST'])
@login_required
def restore_reserved_inventory():
    data = request.get_json()
    for item in data.get('items', []):
        inventory_id = item.get('inventory_id')
        quantity = item.get('quantity')

        inv = Inventory.query.get(inventory_id)
        if inv:
            inv.quantity += quantity
            db.session.add(inv)
        r = redis.Redis(host='localhost', port=6379, db=0)
        # delete redis reservation key
        key = f"reserved_inventory:{inventory_id}"
        r.delete(key)

    db.session.commit()
    return jsonify({"success": True})