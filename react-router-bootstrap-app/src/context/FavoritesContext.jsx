// src/context/FavoritesContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL || '';

  // Fetch the current favorites
  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/favorites/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch favorites');
      const data = await res.json();
      const characterIds = (data || [])
        .filter(fav => fav.character_id !== null)
        .map(fav => fav.character_id);
      setFavorites(characterIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  // Toggle a favorite (add or remove)
  const toggleFavorite = async (characterId) => {
    const isFav = favorites.includes(characterId);
    if (isFav) {
      await removeFavorite(characterId);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/favorites/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ character_id: characterId }),
      });
      if (!res.ok) throw new Error('Failed to add favorite');
      await fetchFavorites();
    } catch (err) {
      console.error('Error adding favorite:', err);
    }
  };

  // Remove a favorite
  const removeFavorite = async (characterId) => {
    try {
      const res = await fetch(`${API_BASE}/api/favorites/character/${characterId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!res.ok) throw new Error('Failed to remove favorite');
      await fetchFavorites();
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []); // ✅ Only run once on mount (not on API_BASE change)

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Custom hook to use the favorites
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
