import { useEffect, useState } from 'react';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ContentContext } from './context/ContentContext';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

import './App.css';
import './variables.css';

export default function App() {
  const [content, setContent] = useState({});

  useEffect(() => {
    fetch('/content.json', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load content.json', err));
  }, []);

  return (
    <UserProvider>
      <FavoritesProvider>
        <CartProvider>
          <ContentContext.Provider value={{ content, setContent }}>
            {/* RouterProvider wraps entire app layout */}
            <RouterProvider router={router} />
          </ContentContext.Provider>
        </CartProvider>
      </FavoritesProvider>
    </UserProvider>
  );
}
