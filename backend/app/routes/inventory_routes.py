from flask import Blueprint, request, jsonify
from app.models import Inventory
from app.utils.decorators import login_required, admin_required 
from app.extensions import db

inventory_bp = Blueprint('inventory', __name__, url_prefix="/api/inventory")

@inventory_bp.route('', methods=['POST'])
@admin_required
def create_inventory():
    data = request.json
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

@inventory_bp.route('/<int:kit_id>', methods=['GET'])
def get_inventory_by_kit(kit_id):
    inventories = Inventory.query.filter_by(kit_id=kit_id).all()
    return jsonify([
        {
            'location': inv.location,
            'location_name': inv.location_name,
            'quantity': inv.quantity,
            'kit_id': inv.kit_id,
            'id':inv.id
        }
        for inv in inventories
    ])

@inventory_bp.route('/item/<int:inventory_id>', methods=['GET'])
def get_inventory_by_id(inventory_id):
    inv = Inventory.query.get(inventory_id)
    if not inv:
        return jsonify({'error': 'Inventory not found'}), 404
    return jsonify({
        'id': inv.id,
        'kit_id': inv.kit_id,
        'location': inv.location,
        'location_name': inv.location_name,
        'quantity': inv.quantity
    })