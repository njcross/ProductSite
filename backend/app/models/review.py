from app.extensions import db
from sqlalchemy import UniqueConstraint

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    kit_id = db.Column(db.Integer, db.ForeignKey('kits.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)

    __table_args__ = (UniqueConstraint('kit_id', 'user_id', name='unique_kit_user_review'),)

    user = db.relationship('User', backref='reviews')
    kit = db.relationship('Kit', back_populates='reviews')
