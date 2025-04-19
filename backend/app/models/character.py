from sqlalchemy import String, Integer, Enum, Text, Float
from sqlalchemy.orm import Mapped, mapped_column
from app import db

class Character(db.Model):
    __tablename__ = "characters"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    alias: Mapped[str] = mapped_column(String(100), nullable=False)
    alignment: Mapped[str] = mapped_column(Enum('hero', 'villain', name='alignment_enum'), nullable=False)
    powers: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
