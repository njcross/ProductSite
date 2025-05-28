from datetime import datetime, timezone
from app.extensions import db


class Purchase(db.Model):
    __tablename__ = 'purchases'
    id = db.Column(db.Integer, primary_key=True)
    kit_id = db.Column(db.Integer, db.ForeignKey('kits.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventory.id'), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    time_bought = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    status = db.Column(db.String(50))
    shipping_address_id = db.Column(db.Integer, db.ForeignKey('shipping_address.id'), nullable=True)

    payment_method = db.Column(db.String(50))
    available_date = db.Column(db.Integer)
    pick_up_date = db.Column(db.Date)

    kit = db.relationship('Kit', back_populates='purchases', overlaps="purchase")
    user = db.relationship('User', backref='purchases')
    inventory = db.relationship('Inventory', back_populates='purchases')

    shipping_address = db.relationship("ShippingAddress", back_populates="purchases")
