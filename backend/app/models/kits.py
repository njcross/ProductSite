from sqlalchemy import String, Integer, Enum, Text, Float
from sqlalchemy.orm import Mapped, mapped_column
from app import db
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import func
from app.models.review import Review

class age_options(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True)

class category_options(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True)

kit_age = db.Table(
    'kit_age',
    db.Column('kit_id', db.Integer, db.ForeignKey('kits.id'), primary_key=True),
    db.Column('age_id', db.Integer, db.ForeignKey('age_options.id'), primary_key=True)
)

kit_category = db.Table(
    'kit_category',
    db.Column('kit_id', db.Integer, db.ForeignKey('kits.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('category_options.id'), primary_key=True)
)

class Kit(db.Model):
    __tablename__ = "kits"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    age = db.relationship('age_options', secondary=kit_age, backref='kits')
    category = db.relationship('category_options', secondary=kit_category, backref='kits')

    reviews = db.relationship('Review', backref='kit', lazy='dynamic')

    @hybrid_property
    def average_rating(self):
        if self.reviews.count() == 0:
            return None
        return round(sum([r.rating for r in self.reviews]) / self.reviews.count(), 1)

    @average_rating.expression
    def average_rating(cls):
        return (
            db.session.query(func.avg(Review.rating))
            .filter(Review.kit_id == cls.id)
            .correlate(cls)
            .as_scalar()
        )
