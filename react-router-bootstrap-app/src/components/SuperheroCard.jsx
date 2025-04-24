import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './SuperheroCard.css';

export default function SuperheroCard({ character, onEdit, onDelete }) {
  const { currentUser } = useUser();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  return (
    <Card className="character-card mb-4" onClick={() => onEdit(character)} style={{ cursor: 'pointer' }}>
      <div className="card-img-wrapper">
  <Card.Img className="card-img" variant="top" src={character.image_url} alt={character.name} />
  </div>
  <Card.Body>
    <Card.Title className="character-name">{character.name}</Card.Title>
    <Card.Subtitle className="character-alias">{character.alias}</Card.Subtitle>
    <Card.Text className="character-description">{character.powers}</Card.Text>
    <Card.Text className="character-price">
  ${character.price.toFixed(2)}
</Card.Text>

          <div className="card-actions">
            {(currentUser) && (
            <Button onClick={(e) => {
              e.stopPropagation();
              addToCart(character);
              navigate('/cart');
            }}>
              Add to Cart
            </Button>
            )}
            {(currentUser?.role === 'admin') && (
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

