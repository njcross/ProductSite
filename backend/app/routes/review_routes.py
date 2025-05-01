from flask import Blueprint, request, jsonify, session
from app.utils.decorators import login_required
from app import db
from app.models.review import Review
from app.schemas.review_schema import ReviewSchema
from sqlalchemy.exc import SQLAlchemyError

review_bp = Blueprint('review_bp', __name__, url_prefix='/api/reviews')
review_schema = ReviewSchema()
reviews_schema = ReviewSchema(many=True)

# 🔍 GET reviews for a kit
@review_bp.route('/kit/<int:kit_id>', methods=['GET'])
def get_reviews_for_kit(kit_id):
    reviews = Review.query.filter_by(kit_id=kit_id).all()
    return reviews_schema.dump(reviews), 200

# ✏️ POST or PUT review (create or update for (kit_id, user_id))
@review_bp.route('/', methods=['POST'])
@login_required
def create_or_update_review():
    data = request.json
    kit_id = data.get('kit_id')
    rating = data.get('rating')
    comment = data.get('comment', '')

    if not kit_id:
        return {"error": "kit_id and rating are required."}, 400

    review = Review.query.filter_by(kit_id=kit_id, user_id=session.get('user_id')).first()
    if review:
        review.rating = rating
        review.comment = comment
    else:
        review = Review(
            kit_id=kit_id,
            user_id=session.get('user_id'),
            rating=rating,
            comment=comment
        )
        db.session.add(review)

    db.session.commit()
    return review_schema.dump(review), 200

@review_bp.route("/reviews/<int:kit_id>", methods=["DELETE"])
@login_required
def delete_own_review(kit_id):
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user_id = session.get('user_id')

    review = Review.query.filter_by(kit_id=kit_id, user_id=user_id).first()
    if not review:
        return jsonify({"error": "Review not found"}), 404

    try:
        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete review"}), 500
