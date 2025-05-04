
def test_create_character(client, admin_auth_header):
    data = {
        "name": "Test Kit",
        "description": "This is a test kit.",
        "price": 19.99,
        "image_url": "http://example.com/testkit.jpg"
    }
    response = client.post("/api/kits", json=data, headers=admin_auth_header)
    assert response.status_code == 201

def test_get_characters(client):
    response = client.get("/api/kits")
    assert response.status_code == 200
