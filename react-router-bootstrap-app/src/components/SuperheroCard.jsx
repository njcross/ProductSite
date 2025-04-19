import React from 'react';
import { Card, Button } from 'react-bootstrap';
import './SuperheroCard.css';

export default function SuperheroCard({ character, onEdit, onDelete }) {
  return (
    <Card className="character-card mb-4">
      <Card.Img className="card-img" variant="top" src={character.image_url} alt={character.name} />
      <Card.Body>
        <Card.Title className="character-name">{character.name}</Card.Title>
        <Card.Subtitle className="character-alias">{character.alias}</Card.Subtitle>
        <Card.Text className="character-description">{character.powers}</Card.Text>

        <div className="card-actions">
        <Button onClick={() => onEdit(character)} aria-label="Edit">
  <i className="fas fa-wrench"></i>
</Button>
<Button onClick={() => onDelete(character.id)} aria-label="Delete">
  <i className="fas fa-trash-alt"></i>
</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

