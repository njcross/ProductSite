from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.extensions import db

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(255), nullable=False)
    coordinates = db.Column(db.String(255), nullable=False)
    location_name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    kit_id = db.Column(db.Integer, db.ForeignKey('kits.id'), nullable=False)

    purchases = db.relationship('Purchase', back_populates='inventory', cascade='all, delete')
    kit = db.relationship('Kit', back_populates='inventories')
    cart_items = db.relationship('CartItem', back_populates='inventory', cascade='all, delete')

