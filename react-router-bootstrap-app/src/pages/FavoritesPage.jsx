// src/pages/FavoritesPage.jsx
import { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import SuperheroCard from '../components/SuperheroCard';
import { Row, Col, Container } from 'react-bootstrap';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import './FavoritesPage.css';


export default function FavoritesPage() {
  const { favorites, fetchFavorites } = useFavorites();
  const [characters, setCharacters] = useState([]);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    if (favorites.length === 0) {
      setCharacters([]);
      return;
    }

    fetch(`${API_BASE}/api/kits/by-ids/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: favorites }),
    })
      .then(res => res.json())
      .then(data => {setCharacters(Array.isArray(data) ? data : data.characters)})
      .catch(err => console.error('Failed to fetch favorites', err));
  }, [favorites, API_BASE]);

  const handleEditClick = (character) => {
    window.scrollTo(0, 0);
    navigate(`/edit/${character.id}`);
  };

  return (
    <Container className="favorites-page my-5">
      <Helmet>
        <title>Favorites – My Play Trays</title>
        <meta name="description" content="Your saved Play Trays and search preferences." />
      </Helmet>
      <h2>My Favorite Trays</h2>
      <Row className="character-row d-flex justify-content-center">
        {characters.map(char => (
          <Col key={char.id} xs={12} sm={6} md={4} lg={3}>
            <SuperheroCard 
              character={char}
              onEdit={handleEditClick}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
