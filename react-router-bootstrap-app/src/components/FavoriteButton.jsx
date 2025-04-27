import { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import './FavoriteButton.css';

export default function FavoriteButton({ characterId }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const API_BASE = process.env.REACT_APP_API_URL;
  const { favorites, toggleFavorite: toggleFavoriteFromContext, fetchFavorites } = useFavorites();

  useEffect(() => {
    fetch(`${API_BASE}/api/favorites/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(res => res.json())
      .then(data => {
        const favoritedIds = data.map(f => f.character_id);
        setIsFavorited(favoritedIds.includes(characterId));
      })
      .catch(err => console.error('Failed to fetch favorites:', err));
  }, [characterId]);

  const handleToggleFavorite = async () => {
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const endpoint = isFavorited
        ? `${API_BASE}/api/favorites/character/${characterId}`
        : `${API_BASE}/api/favorites/`;

      const response = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: method === 'POST'
          ? JSON.stringify({ character_id: characterId })
          : undefined
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      setIsFavorited(!isFavorited);
      await fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        handleToggleFavorite();
      }}
      aria-label="Toggle Favorite"
    >
      {isFavorited ? '❤️' : '🤍'}
    </button>
  );
}
