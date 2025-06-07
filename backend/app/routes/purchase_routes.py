import flask
import stripe
from app.extensions import db
from app.models.purchase import Purchase
from app.schemas.purchase_schema import PurchaseSchema
from app.utils.decorators import admin_required, login_required
from flask import Blueprint, request, jsonify, session
from sqlalchemy.orm import joinedload
from app.config import Config
from datetime import datetime, timedelta, timezone


purchase_bp = Blueprint('purchase', __name__)
purchase_schema = PurchaseSchema()
purchases_schema = PurchaseSchema(many=True)

stripe.api_key = Config.STRIPE_SECRET_KEY  # Ensure this is securely set

@purchase_bp.route('/api/purchases', methods=['POST'])
@login_required
def create_purchase():
    data = request.get_json()
    user_id = session.get('user_id')

    # 1. Extract cart items and billing info
    items = data.get('items', [])
    billing_details = data.get('billing_details', {})
    shipping_address_id = data.get('shipping_address_id')  # optional

    if not items or not billing_details:
        return jsonify({'error': 'Missing required data'}), 400

    # 2. Calculate total price
    total_amount = 0
    for item in items:
        quantity = item.get('quantity', 1)
        price = item.get('price', 0)
        total_amount += int(float(price) * 100) * quantity  # in cents

    if total_amount <= 0:
        return jsonify({'error': 'Invalid cart total'}), 400

    # 3. Create PaymentIntent
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=total_amount,
            currency='usd',
            payment_method=billing_details.get('payment_method_id'),
            confirmation_method='manual',
            confirm=True,
            receipt_email=billing_details.get('email'),
        )
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 400

    if payment_intent.status != 'succeeded':
        return jsonify({'error': 'Payment not completed', 'payment_status': payment_intent.status}), 402

    # 4. Save all valid purchases to DB
    created_purchases = []
    for item in items:
        new_purchase = Purchase(
            kit_id=item['kit_id'],
            user_id=user_id,
            quantity=item['quantity'],
            inventory_id=item.get('inventory_id'),
            payment_method='stripe',
            available_date=None,  # or real logic
            pick_up_date=datetime.now(timezone.utc) + timedelta(hours=24),
            status="Ready for pickup",
            shipping_address_id=shipping_address_id
        )
        db.session.add(new_purchase)
        created_purchases.append(new_purchase)

    db.session.commit()

    purchases = Purchase.query.options(
        joinedload(Purchase.kit),
        joinedload(Purchase.user),
        joinedload(Purchase.inventory)
    ).filter(Purchase.id.in_([p.id for p in created_purchases])).all()

    return jsonify([purchase_schema.dump(p) for p in purchases]), 201

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
    new_status = data.get('status')
    prev_status = purchase.status

    # Update allowed fields if present in request data
    allowed_fields = ['status', 'available_date', 'pick_up_date', 'payment_method', 'quantity', 'inventory_id']
    for field in allowed_fields:
        if field in data:
            setattr(purchase, field, data[field])

    # Inventory adjustment logic
    if prev_status != 'Returned' and new_status == 'Returned':
        # Increment inventory if returning
        if purchase.inventory:
            purchase.inventory.quantity += purchase.quantity
    elif prev_status == 'Returned' and new_status != 'Returned':
        # Decrement inventory if returning to another status
        if purchase.inventory:
            if purchase.inventory.quantity < purchase.quantity:
                return jsonify({'error': 'Insufficient inventory to revert return'}), 400
            purchase.inventory.quantity -= purchase.quantity
            
    db.session.commit()

    updated_purchase = Purchase.query.options(
        joinedload(Purchase.kit),
        joinedload(Purchase.user),
        joinedload(Purchase.inventory)
    ).filter_by(id=purchase.id).first()

    return jsonify(purchase_schema.dump(updated_purchase)), 200
