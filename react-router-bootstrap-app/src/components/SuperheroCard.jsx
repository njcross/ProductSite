import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate, useLocation } from 'react-router-dom';
import EditableField from '../components/EditableField';
import FavoriteButton from './FavoriteButton';
import StarRating from './StarRating';
import './SuperheroCard.css';


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

        {/* ⭐ Star Rating & Review Count (Read-only) */}
        <div className="rating-section mb-2">
          <StarRating rating={character.average_rating || 0} />
          {character.review_count > 0 && (
            <small className="text-muted">{character.review_count} review{character.review_count !== 1 ? 's' : ''}</small>
          )}
        </div>

        <Card.Text className="character-price">
          <strong>${character.price.toFixed(2)}</strong>
        </Card.Text>

        <div className="card-actions">
          {currentUser && (
            <Button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await addToCart(character);
                  window.scrollTo(0, 0);
                  navigate('/cart');
                } catch (err) {
                  if (err.message === 'User cancelled inventory selection') {
                    // Do nothing — user cancelled, so skip navigation
                    return;
                  }
                  alert(err.message || 'Failed to add to cart');
                }
              }}
            >
              <EditableField contentKey="content_76" />
            </Button>
          )}
        </div>

      </Card.Body>
    </Card>
  );
}
