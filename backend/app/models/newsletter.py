from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions import db

class Newsletter(db.Model):
    __tablename__ = "newsletter"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    newsletter_value: Mapped[int] = mapped_column(Integer, nullable=False)

    def __repr__(self):
        return f"<Newsletter email={self.email} value={self.newsletter_value}>"
