import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate, useLocation } from 'react-router-dom';
import EditableField from '../components/EditableField';
import FavoriteButton from './FavoriteButton';
import './SuperheroCard.css';

export default function SuperheroCard({ character, onEdit, onDelete }) {
  const { currentUser } = useUser();
  const { addToCart } = useCart();
  const { removeFavorite } = useFavorites(); // ⬅️ we add this to remove favorites
  const navigate = useNavigate();
  const location = useLocation(); // ⬅️ we add this to check the current URL

  const isFavoritesPage = location.pathname === '/favorites';

  return (
    <Card className="character-card md={2} sm={12}" onClick={() => onEdit(character)} style={{ cursor: 'pointer' }}>
      <div className="card-img-wrapper">
        <Card.Img className="card-img" variant="top" src={character.image_url} alt={character.name} />
      </div>
      <Card.Body>
  <Card.Title className="character-name d-flex justify-content-between align-items-center">
    <span className="character-name-text">{character.name}</span>
    {currentUser && (
      !isFavoritesPage ? (
        <FavoriteButton characterId={character.id} />
      ) : (
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            removeFavorite(character.id);
          }}
        >
          Remove
        </Button>
      )
    )}
  </Card.Title>

  <Card.Subtitle className="character-alias">{character.alias}</Card.Subtitle>
  <Card.Text className="character-description">{character.powers}</Card.Text>
  <Card.Text className="character-price">
    ${character.price.toFixed(2)}
  </Card.Text>

  <div className="card-actions">
    {currentUser && (
      <Button onClick={(e) => {
        e.stopPropagation();
        addToCart(character);
        navigate('/cart');
      }}>
        <EditableField contentKey="content_76" />
      </Button>
    )}
    {currentUser?.role === 'admin' && (
      <Button onClick={(e) => {
        e.stopPropagation();
        onDelete(character.id);
      }} aria-label="Delete">
        <i className="fas fa-trash-alt"></i>
      </Button>
    )}
  </div>
</Card.Body>

    </Card>
  );
}
