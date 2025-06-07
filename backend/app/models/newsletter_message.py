from app.extensions import db
from datetime import datetime

class NewsletterMessage(db.Model):
    __tablename__ = 'newsletter_message'

    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    newsletter_value = db.Column(db.String(100), nullable=False)  # Target group/category
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<NewsletterMessage {self.subject} @ {self.sent_at}>"
