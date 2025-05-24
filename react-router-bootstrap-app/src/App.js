import { useEffect, useState } from 'react';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ContentContext } from './context/ContentContext';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { HelmetProvider } from 'react-helmet-async';

import './App.css';
import './variables.css';

export default function App() {
  const [content, setContent] = useState({});

  useEffect(() => {
    const shouldRefetch = sessionStorage.getItem('force_content_refetch') == 'true';
  
    if (!shouldRefetch) {
      const cached = sessionStorage.getItem('content_cache');
      if (cached) {
        try {
          setContent(JSON.parse(cached));
          return;
        } catch {
          sessionStorage.removeItem('content_cache');
        }
      }
    }
  
    // Always refetch if flagged
    fetch('/content.json', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setContent(data);
        sessionStorage.setItem('content_cache', JSON.stringify(data));
        sessionStorage.removeItem('force_content_refetch'); // Clear flag after refresh
      })
      .catch(err => console.error('Failed to load content.json', err));
  }, []);
  
  

  const updateContent = (key, value) => {
    setContent(prev => {
      const updated = { ...prev, [key]: value };
      sessionStorage.setItem('content_cache', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserProvider>
      <FavoritesProvider>
        <CartProvider>
          <HelmetProvider>
            <ContentContext.Provider value={{ content, setContent: updateContent }}>
              <RouterProvider router={router} />
            </ContentContext.Provider>
          </HelmetProvider>
        </CartProvider>
      </FavoritesProvider>
    </UserProvider>
  );
}
