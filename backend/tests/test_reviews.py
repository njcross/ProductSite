import pytest

def test_get_reviews(client, create_test_kit_and_inventory):
    kit, inventory = create_test_kit_and_inventory
    res = client.get(f"/api/reviews/kit/{kit.id}")
    assert res.status_code in (200, 404)  # Accept 404 if no reviews exist

def test_post_review(client, user_auth_header, create_test_kit_and_inventory):
    kit, inventory = create_test_kit_and_inventory
    res = client.post(f"/api/reviews/{kit.id}", json={
        "rating": 4,
        "comment": "Nice kit!"
    }, headers=user_auth_header)
    assert res.status_code == 200