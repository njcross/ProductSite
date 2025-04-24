// src/context/FavoritesContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [favoriteFilters, setFavoriteFilters] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const addFilter = (filter) => {
    setFavoriteFilters(prev => [...prev, filter]);
  };

  useEffect(() => {
    // Optional: Load from localStorage or backend
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, favoriteFilters, addFilter }}>
      {children}
    </FavoritesContext.Provider>
  );
}
