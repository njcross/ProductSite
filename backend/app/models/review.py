from app.extensions import db
from sqlalchemy import UniqueConstraint

# Association table for Review ↔ AgeOption
review_age = db.Table(
    'review_age',
    db.Column('review_id', db.Integer, db.ForeignKey('reviews.id'), primary_key=True),
    db.Column('age_id', db.Integer, db.ForeignKey('age_options.id'), primary_key=True)
)

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    kit_id = db.Column(db.Integer, db.ForeignKey('kits.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)

    # ✅ New fields
    length_of_play = db.Column(db.String(20))  # "<15 mins", etc.
    age = db.relationship('age_options', secondary=review_age, backref='reviews')

    __table_args__ = (UniqueConstraint('kit_id', 'user_id', name='unique_kit_user_review'),)

    user = db.relationship('User', backref='reviews')
    kit = db.relationship('Kit', back_populates='reviews')
