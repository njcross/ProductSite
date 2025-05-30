from sqlalchemy import String, Integer, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(Enum('admin', 'customer', name='role_enum'), nullable=False)
    oauth_provider: Mapped[str] = mapped_column(String(50), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    cart_items = db.relationship('CartItem', back_populates='user')
    shipping_addresses = db.relationship("ShippingAddress", back_populates="user", cascade="all, delete-orphan")

