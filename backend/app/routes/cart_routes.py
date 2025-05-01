from flask import Blueprint, request, jsonify, session
from app import db
from app.models.cart_item import CartItem
from app.schemas.cart_schema import CartSchema
from app.utils.decorators import login_required
from sqlalchemy.orm import joinedload

cart_bp = Blueprint('cart', __name__, url_prefix='/api')
cart_schema = CartSchema()
carts_schema = CartSchema(many=True)

@cart_bp.route('/cart', methods=['GET'])
@login_required
def get_cart():
    user_id = session.get('user_id')
    items = db.session.query(CartItem)\
        .options(joinedload(CartItem.kit))\
        .filter_by(user_id=user_id).all()
    return jsonify(carts_schema.dump(items)), 200

@cart_bp.route('/cart', methods=['POST'])
@login_required
def add_to_cart():
    data = request.json
    user_id = session.get('user_id')
    item = db.session.query(CartItem).filter_by(user_id=user_id, kit_id=data['character_id']).first()
    if item:
        item.quantity += data.get('quantity', 1)
    else:
        item = CartItem(user_id=user_id, kit_id=data['character_id'], quantity=data.get('quantity', 1))
        db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Cart updated"}), 201

@cart_bp.route('/cart/<int:item_id>', methods=['PUT'])
@login_required
def update_cart(item_id):
    data = request.json
    item = db.session.get(CartItem, item_id)
    if item:
        item.quantity = data['quantity']
        db.session.commit()
        return jsonify({"message": "Updated"}), 200
    return jsonify({"message": "Not found"}), 404

@cart_bp.route('/cart/<int:item_id>', methods=['DELETE'])
@login_required
def delete_cart(item_id):
    item = db.session.get(CartItem, item_id)
    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 200
    return jsonify({"message": "Not found"}), 404
