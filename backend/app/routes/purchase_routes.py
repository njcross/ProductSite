import flask
from app.extensions import db
from app.models.purchase import Purchase
from app.schemas.purchase_schema import PurchaseSchema
from app.utils.decorators import admin_required, login_required
from flask import Blueprint, request, jsonify, session
from sqlalchemy.orm import joinedload
from datetime import datetime, timedelta, timezone

purchase_bp = Blueprint('purchase', __name__)
purchase_schema = PurchaseSchema()
purchases_schema = PurchaseSchema(many=True)

@purchase_bp.route('/api/purchases', methods=['POST'])
@login_required
def create_purchase():
    data = request.get_json()

    new_purchase = Purchase(
        kit_id=data['kit_id'],
        user_id=session.get('user_id'),
        quantity=data['quantity'],
        inventory_id=data.get('inventory_id'),
        payment_method=data.get('payment_method'),
        available_date="1234",
        pick_up_date=datetime.now(timezone.utc) + timedelta(hours=24),
        status="Ready for pickup"
    )

    db.session.add(new_purchase)
    db.session.commit()

    purchase = Purchase.query.options(
        joinedload(Purchase.kit),
        joinedload(Purchase.user),
        joinedload(Purchase.inventory)
    ).filter_by(id=new_purchase.id).first()

    return jsonify(purchase_schema.dump(purchase)), 201

@purchase_bp.route('/api/purchases', methods=['GET'])
@login_required
def get_my_purchases():
    """Get purchases for the logged-in user"""
    purchases = Purchase.query.filter_by(user_id=session.get('user_id')).all()
    return jsonify(purchases_schema.dump(purchases)), 200

@purchase_bp.route('/api/purchases/all', methods=['GET'])
@admin_required
def get_all_purchases():
    purchases = Purchase.query.all()
    return jsonify(purchases_schema.dump(purchases)), 200

@purchase_bp.route('/api/purchases/<int:purchase_id>', methods=['DELETE'])
@login_required
def delete_purchase(purchase_id):
    purchase = Purchase.query.get_or_404(purchase_id)
    if purchase.user_id != session.get('user_id') and session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(purchase)
    db.session.commit()
    return jsonify({'message': 'Purchase deleted successfully'}), 200

@purchase_bp.route('/api/purchases/<int:purchase_id>', methods=['PUT'])
@admin_required
def update_purchase(purchase_id):
    """Admin-only endpoint to update purchase fields"""
    purchase = Purchase.query.get_or_404(purchase_id)
    data = request.get_json()

    # Update allowed fields if present in request data
    allowed_fields = ['status', 'available_date', 'pick_up_date', 'payment_method', 'quantity', 'inventory_id']
    for field in allowed_fields:
        if field in data:
            setattr(purchase, field, data[field])

    db.session.commit()

    updated_purchase = Purchase.query.options(
        joinedload(Purchase.kit),
        joinedload(Purchase.user),
        joinedload(Purchase.inventory)
    ).filter_by(id=purchase.id).first()

    return jsonify(purchase_schema.dump(updated_purchase)), 200
