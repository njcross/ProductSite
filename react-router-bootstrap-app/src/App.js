import { useEffect, useState } from 'react';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ContentContext } from './context/ContentContext';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from './context/ModalContext';

import './App.css';
import './variables.css';

export default function App() {
  const [content, setContent] = useState({});

  useEffect(() => {
  
    // Always refetch if flagged
    fetch('/content.json', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setContent(data);
        sessionStorage.setItem('content_cache', JSON.stringify(data));
        sessionStorage.removeItem('force_content_refetch'); // Clear flag after refresh
      })
      .catch(err => console.error('Failed to load content.json', err));
  }, [sessionStorage]);
  
  

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
          <ModalProvider>
          <HelmetProvider>
            <ContentContext.Provider value={{ content, setContent: updateContent }}>
              <RouterProvider router={router} />
            </ContentContext.Provider>
          </HelmetProvider>
          </ModalProvider>
        </CartProvider>
      </FavoritesProvider>
    </UserProvider>
  );
}
