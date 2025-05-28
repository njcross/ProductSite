from flask import Blueprint, request, jsonify
from app.models import Inventory
from app.utils.decorators import login_required, admin_required 
from app.extensions import db
from sqlalchemy.orm import joinedload
from app.schemas.kit_schema import kit_schema
from app.schemas.inventory_schema import inventories_schema, inventory_schema
import requests
import os

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
    data = request.json
    inv = Inventory.query.filter_by(kit_id=data['kit_id'], location=data['location']).first()
    if not inv:
        return jsonify({'error': 'Inventory not found'}), 404
    inv.location_name = data.get('location_name', inv.location_name)
    inv.quantity = data.get('quantity', inv.quantity)
    rtn = {}
    location_name = data.get('location_name', '').lower()
    if location_name == 'warehouse':
        inv.coordinates = ''
        inv.location = ''
    else:
        rtn['address'] = data['location']
        if not data.get("no_address_lookup"):
            rtn = find_address(data['location'])
            if isinstance(rtn, tuple):  # (Response, status_code)
                return rtn
            if isinstance(rtn, dict):
                inv.coordinates = f"{rtn['lat']}, {rtn['lng']}"
                inv.location = rtn['address']
            else:
                inv.coordinates = "0,0"
                inv.location = data['location']
        else:
            inv.coordinates = "0,0"
            del data['no_address_lookup']

    

    db.session.commit()
    return jsonify({'message': 'Inventory updated'})

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
    inv = Inventory.query.filter_by(kit_id=data['kit_id'], location=data['location']).first()
    if not inv or inv.quantity <= 0:
        return jsonify({'error': 'Insufficient inventory'}), 400
    inv.quantity -= 1
    db.session.commit()
    return jsonify({'message': 'Inventory decremented', 'new_quantity': inv.quantity})

@inventory_bp.route('/increment', methods=['POST'])
@login_required
def increment_quantity():
    data = request.get_json()
    kit_id = data.get('kit_id')
    location = data.get('location')

    if kit_id is None or location is None:
        return jsonify({'error': 'Missing kit_id or location'}), 400

    inv = Inventory.query.filter_by(kit_id=kit_id, location=location).first()
    if not inv:
        return jsonify({'error': 'Inventory record not found'}), 404

    inv.quantity += 1
    db.session.commit()

    return jsonify({'message': 'Inventory incremented', 'new_quantity': inv.quantity})


@inventory_bp.route('/<int:kit_id>', methods=['GET'])
def get_inventory_by_kit(kit_id):
    inventories = Inventory.query.options(joinedload(Inventory.kit)).filter_by(kit_id=kit_id).all()
    
    return jsonify(inventories_schema.dump(inventories))


@inventory_bp.route('', methods=['GET'])
def get_inventory():
    inventories = Inventory.query.options(joinedload(Inventory.kit)).all()
    return jsonify(inventories_schema.dump(inventories))


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
