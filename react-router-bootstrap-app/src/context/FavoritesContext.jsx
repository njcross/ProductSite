// src/context/FavoritesContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext'; // <-- 🔥 import this!

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const { currentUser } = useUser(); // <-- 🔥 get currentUser
  const API_BASE = process.env.REACT_APP_API_URL || '';

  const fetchFavorites = async () => {
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
      const characterIds = (data || [])
        .filter(fav => fav.character_id !== null)
        .map(fav => fav.character_id);
      setFavorites(characterIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

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
      await fetchFavorites();
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFavorites(); // ✅ only if logged in
    } else {
      setFavorites([]); // ✅ if logged out, clear favorites
    }
  }, [currentUser]); // ✅ Re-run when login status changes

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, removeFavorite }}>
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
