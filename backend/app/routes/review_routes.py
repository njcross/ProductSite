from flask import Blueprint, request, jsonify, session
from app.utils.decorators import login_required
from app.extensions import db
from app.models.review import Review, review_age
from app.models.purchase import Purchase
from app.models.kits import age_options
from app.schemas.review_schema import ReviewSchema
from sqlalchemy.exc import SQLAlchemyError

review_bp = Blueprint('review_bp', __name__, url_prefix='/api/reviews')
review_schema = ReviewSchema()
reviews_schema = ReviewSchema(many=True)

# 🔍 GET reviews for a kit
@review_bp.route('/kit/<int:kit_id>', methods=['GET'])
def get_reviews_for_kit(kit_id):
    reviews = Review.query.filter_by(kit_id=kit_id).all()
    result = []
    for review in reviews:
        is_verified = Purchase.query.filter_by(user_id=review.user_id, kit_id=kit_id).first() is not None
        result.append({
            'user_id': review.user_id,
            'username': review.user.username,
            'rating': review.rating,
            'comment': review.comment,
            'verified': is_verified,
            'length_of_play': review.length_of_play,
            'age': [{'id': a.id, 'name': a.name} for a in review.age]
        })
    return jsonify(result)


# ✏️ POST or PUT review (create or update for (kit_id, user_id))
@review_bp.route('/<int:kit_id>', methods=['POST'])
@login_required
def create_or_update_review(kit_id):
    data = request.json
    rating = data.get('rating')
    comment = data.get('comment', '')
    age_ids = data.get('age_ids', [])
    length_of_play = data.get('length_of_play', None)

    if not rating or not kit_id:
        return {"error": "kit_id and rating are required."}, 400

    user_id = session.get('user_id')
    review = Review.query.filter_by(kit_id=kit_id, user_id=user_id).first()

    if review:
        review.rating = rating
        review.comment = comment
        review.length_of_play = length_of_play
        review.age = db.session.query(age_options).filter(age_options.id.in_(age_ids)).all()
    else:
        review = Review(
            kit_id=kit_id,
            user_id=user_id,
            rating=rating,
            comment=comment,
            length_of_play=length_of_play
        )
        review.age = db.session.query(age_options).filter(age_options.id.in_(age_ids)).all()
        db.session.add(review)

    db.session.commit()
    return review_schema.dump(review), 200


# ❌ DELETE review
@review_bp.route("/<int:kit_id>", methods=["DELETE"])
@login_required
def delete_own_review(kit_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    review = Review.query.filter_by(kit_id=kit_id, user_id=user_id).first()
    if not review:
        return jsonify({"error": "Review not found"}), 404

    try:
        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted"}), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Failed to delete review"}), 500
