
def test_add_favorite(client, user_auth_header):
    res = client.post('/api/favorites/', json={"character_id": 1}, headers=user_auth_header)
    assert res.status_code == 201

def test_get_favorites(client, user_auth_header):
    res = client.get('/api/favorites/', headers=user_auth_header)
    assert res.status_code == 200
