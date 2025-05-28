from flask import Blueprint, jsonify, request, session
from app.models import ShippingAddress
from app.extensions import db
from app.utils.decorators import login_required

from app.schemas.shipping_address_schema import shipping_address_schema, shipping_addresses_schema

shipping_bp = Blueprint('shipping', __name__, url_prefix='/api/shipping-addresses')

@shipping_bp.route('', methods=['GET'])
@login_required
def get_shipping_addresses():
    addresses = ShippingAddress.query.filter_by(user_id=session.get('user_id')).all()
    return jsonify(shipping_addresses_schema.dump(addresses))

@shipping_bp.route('', methods=['POST'])
@login_required
def add_shipping_address():
    data = request.get_json()
    new_address = ShippingAddress(
        user_id=session.get('user_id'),
        line1=data.get('line1', ''),
        city=data.get('city', ''),
        state=data.get('state', ''),
        postal_code=data.get('postal_code', ''),
        country=data.get('country', '')
    )
    db.session.add(new_address)
    db.session.commit()
    return jsonify(shipping_address_schema.dump(new_address)), 201
