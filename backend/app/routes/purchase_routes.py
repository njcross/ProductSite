import flask
from app import db
from app.models.purchase import Purchase
from app.schemas.purchase_schema import PurchaseSchema
from app.utils.decorators import admin_required, login_required
from flask import Blueprint, request, jsonify, session
from sqlalchemy.orm import joinedload

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
        quantity=data['quantity']
    )
    db.session.add(new_purchase)
    db.session.commit()
    db.session.refresh(new_purchase)
    purchase = (
    db.session.query(Purchase)
        .options(joinedload(Purchase.kit), joinedload(Purchase.user))
        .get(new_purchase.id)
    )
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
