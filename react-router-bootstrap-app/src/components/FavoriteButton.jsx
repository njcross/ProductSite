// src/components/FavoriteButton.jsx
import { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import './FavoriteButton.css';

export default function FavoriteButton({ characterId }) {
  const { favorites, toggleFavorite } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    setIsFavorited(favorites.includes(characterId));
  }, [favorites, characterId]);

  return (
    <button
      className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(characterId);
      }}
      aria-label="Toggle Favorite"
    >
      ❤️
    </button>
  );
}
