// src/pages/FavoritesPage.jsx
import { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import SuperheroCard from '../components/SuperheroCard';
import { Row, Col, Container } from 'react-bootstrap';
import './FavoritesPage.css';


export default function FavoritesPage() {
  const { favorites, fetchFavorites } = useFavorites();
  const [characters, setCharacters] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    if (favorites.length === 0) {
      setCharacters([]);
      return;
    }

    fetch(`/characters/by-ids/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ ids: favorites }),
    })
      .then(res => res.json())
      .then(data => {setCharacters(Array.isArray(data) ? data : data.characters)})
      .catch(err => console.error('Failed to fetch favorites', err));
  }, [favorites, API_BASE]);

  return (
    <Container className="favorites-page my-5">
      <h2>My Favorite Characters</h2>
      <Row className="character-row d-flex justify-content-center">
        {characters.map(char => (
          <Col key={char.id} xs={12} sm={6} md={4} lg={3}>
            <SuperheroCard character={char} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
