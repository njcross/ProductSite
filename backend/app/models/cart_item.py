from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app import db
from app.models.character import Character
from app.models.user import User
from sqlalchemy.orm import relationship

class CartItem(db.Model):
    __tablename__ = "cart_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    character_id: Mapped[int] = mapped_column(ForeignKey('characters.id'), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    user = relationship("User")
    character = relationship("Character")
