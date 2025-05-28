from flask import Blueprint, jsonify, request
from app.models import ShippingAddress
from app.extensions import db
from flask_login import login_required, current_user
from app.schemas.shipping_address_schema import shipping_address_schema, shipping_addresses_schema

shipping_bp = Blueprint('shipping', __name__, url_prefix='/api/shipping-addresses')

@shipping_bp.route('', methods=['GET'])
@login_required
def get_shipping_addresses():
    addresses = ShippingAddress.query.filter_by(user_id=current_user.id).all()
    return jsonify(shipping_addresses_schema.dump(addresses))

@shipping_bp.route('', methods=['POST'])
@login_required
def add_shipping_address():
    data = request.get_json()
    new_address = ShippingAddress(
        user_id=current_user.id,
        line1=data.get('line1', ''),
        city=data.get('city', ''),
        state=data.get('state', ''),
        postal_code=data.get('postal_code', ''),
        country=data.get('country', '')
    )
    db.session.add(new_address)
    db.session.commit()
    return jsonify(shipping_address_schema.dump(new_address)), 201
