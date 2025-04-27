// src/context/FavoritesContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL;

  // Add this function inside FavoritesProvider
const fetchFavorites = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/favorites/`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const data = await res.json();
    const characterIds = data
      .filter(fav => fav.character_id !== null)
      .map(fav => fav.character_id);
    setFavorites(characterIds);
  } catch (err) {
    console.error('Failed to load favorites', err);
  }
};

// Replace your old useEffect to just call fetchFavorites
useEffect(() => {
  fetchFavorites();
}, [API_BASE]);


const toggleFavorite = async (characterId) => {
  const isFav = favorites.includes(characterId);

  if (isFav) {
    removeFavorite(characterId); // Call removeFavorite directly
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
    const data = await res.json();
    if (res.ok && data.character_id) {
      await fetchFavorites(); // ✅ refetch updated favorites
    }
  } catch (err) {
    console.error('Failed to toggle favorite', err);
  }
};

// Update your removeFavorite like this:
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
    if (res.ok) {
      // Refetch the updated favorites
      await fetchFavorites();
    } else {
      console.error('Failed to remove favorite');
    }
  } catch (err) {
    console.error('Error removing favorite', err);
  }
};


  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
