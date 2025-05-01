from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.extensions import db
from app.models.kits import Kit
from app.models.user import User
from sqlalchemy.orm import relationship

class CartItem(db.Model):
    __tablename__ = "cart_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    kit_id: Mapped[int] = mapped_column(ForeignKey('kits.id'), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    user: Mapped["User"] = relationship("User", back_populates="cart_items")
    kit: Mapped["Kit"] = relationship("Kit", back_populates="cart_items")
