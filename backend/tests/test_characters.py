
def test_create_character(client, admin_auth_header):
    character_data = {
        "name": "Test Hero",
        "alias": "Hero Alias",
        "alignment": "hero",
        "powers": "Flying",
        "image_url": "http://example.com/image.png",
        "price": 5.0
    }
    response = client.post("/characters", json=character_data, headers=admin_auth_header)
    assert response.status_code == 201

def test_get_characters(client):
    response = client.get("/characters")
    assert response.status_code == 200
