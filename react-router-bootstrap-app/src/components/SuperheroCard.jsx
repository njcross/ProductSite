import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate, useLocation } from 'react-router-dom';
import EditableField from '../components/EditableField';
import FavoriteButton from './FavoriteButton';
import './SuperheroCard.css';

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>★</span>
    );
  }
  return <div className="star-rating mb-2">{stars}</div>;
};

export default function SuperheroCard({ character, onEdit, onDelete }) {
  const { currentUser } = useUser();
  const { addToCart } = useCart();
  const { removeFavorite } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

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

        <Card.Text className="character-description">
          {character.description?.length > 100
            ? character.description.slice(0, 100) + '...'
            : character.description}
        </Card.Text>

        <Card.Text className="character-meta">
          <strong>Age Range:</strong> {character.age?.map(a => a.name).join(', ') || 'N/A'}
        </Card.Text>

        <Card.Text className="character-meta">
          <strong>Categories:</strong> {character.category?.map(c => c.name).join(', ') || 'N/A'}
        </Card.Text>

        {/* ⭐ Star Rating (Read-only) */}
        <StarRating rating={character.rating || 0} />

        <Card.Text className="character-price">
          <strong>${character.price.toFixed(2)}</strong>
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
