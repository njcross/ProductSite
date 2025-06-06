// src/context/FavoritesContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from './UserContext';

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const { currentUser } = useUser();
  const API_BASE = process.env.REACT_APP_API_URL || '';

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/favorites/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch favorites');
      const data = await res.json();
      const kitIds = (data || [])
        .filter(fav => fav.kit_id !== null)
        .map(fav => fav.kit_id);
      setFavorites(kitIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [API_BASE]);

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
        },
        body: JSON.stringify({ character_id: characterId }),
      });
      if (!res.ok) throw new Error('Failed to add favorite');
      await fetchFavorites();
    } catch (err) {
      console.error('Error adding favorite:', err);
    }
  };

  const removeFavorite = async (characterId) => {
    try {
      const res = await fetch(`${API_BASE}/api/favorites/character/${characterId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to remove favorite');
      setFavorites(prev => prev.filter(id => id !== characterId));
      await fetchFavorites();
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [currentUser, fetchFavorites]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      toggleFavorite,
      removeFavorite,
      fetchFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
