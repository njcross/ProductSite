import pytest

def test_get_reviews(client, create_test_kit):
    res = client.get(f"/api/reviews/kit/{create_test_kit.id}")
    assert res.status_code in (200, 404)  # Accept 404 if no reviews exist

def test_post_review(client, user_auth_header, create_test_kit):
    res = client.post(f"/api/reviews/{create_test_kit.id}", json={
        "rating": 4,
        "comment": "Nice kit!"
    }, headers=user_auth_header)
    assert res.status_code == 200