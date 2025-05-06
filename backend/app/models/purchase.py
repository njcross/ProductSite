from datetime import datetime
from app.extensions import db

class Purchase(db.Model):
    __tablename__ = 'purchases'
    id = db.Column(db.Integer, primary_key=True)
    kit_id = db.Column(db.Integer, db.ForeignKey('kits.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventory.id'), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    time_bought = db.Column(db.DateTime, default=datetime.utcnow)

    kit = db.relationship('Kit', back_populates='purchases', overlaps="purchase")
    user = db.relationship('User', backref='purchases')
    inventory = db.relationship('Inventory', back_populates='purchases')  # changed backref name

