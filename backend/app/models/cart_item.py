from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.extensions import db
from app.models.kits import Kit
from app.models.user import User
from app.models.inventory import Inventory

class CartItem(db.Model):
    __tablename__ = "cart_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    kit_id: Mapped[int] = mapped_column(ForeignKey('kits.id'), nullable=False)
    inventory_id: Mapped[int] = mapped_column(ForeignKey('inventory.id'), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    user: Mapped["User"] = relationship("User", back_populates="cart_items")
    kit: Mapped["Kit"] = relationship("Kit", back_populates="cart_items")
    inventory: Mapped["Inventory"] = relationship("Inventory", back_populates="cart_items")
