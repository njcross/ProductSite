# routes/checkout_routes.py

from flask import Blueprint, request, jsonify
import stripe
import os

checkout_bp = Blueprint('checkout', __name__)
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

@checkout_bp.route('/api/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = request.get_json()
    cart = data.get("cart", [])
    location_name = data.get("location_name", "")

    line_items = [{
        "price_data": {
            "currency": "usd",
            "product_data": {"name": item["title"]},
            "unit_amount": int(float(item["price"]) * 100),
        },
        "quantity": item["quantity"],
    } for item in cart]

    session_data = {
        "payment_method_types": ["card"],
        "line_items": line_items,
        "mode": "payment",
        # "success_url": "http://myplaytray.com/cart/success",
        "cancel_url": "http://myplaytray.com/cart",
    }

    if location_name.lower() == "warehouse":
        session_data["shipping_address_collection"] = {
            "allowed_countries": ["US"]
        }

    try:
        session = stripe.checkout.Session.create(**session_data)
        return jsonify({"id": session.id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
