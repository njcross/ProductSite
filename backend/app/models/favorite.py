from sqlalchemy import Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions import db

class Favorite(db.Model):
    __tablename__ = 'favorites'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    kit_id: Mapped[int] = mapped_column(Integer, ForeignKey('kits.id'), nullable=True)
    filter_json: Mapped[str] = mapped_column(Text, nullable=True)
    filter_name: Mapped[str] = mapped_column(Text, nullable=True)

    kit = db.relationship("Kit", backref="favorites")