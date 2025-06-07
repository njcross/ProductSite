import { useEffect, useState } from 'react';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ContentContext } from './context/ContentContext';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from './context/ModalContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import './App.css';
import './variables.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function App() {
  const [content, setContent] = useState({});

  useEffect(() => {
    fetch('/content.json', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setContent(data);
        sessionStorage.setItem('content_cache', JSON.stringify(data));
        sessionStorage.removeItem('force_content_refetch');
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
          <ModalProvider>
            <HelmetProvider>
              <Elements stripe={stripePromise}>
                <ContentContext.Provider value={{ content, setContent: updateContent }}>
                  <RouterProvider router={router} />
                </ContentContext.Provider>
              </Elements>
            </HelmetProvider>
          </ModalProvider>
        </CartProvider>
      </FavoritesProvider>
    </UserProvider>
  );
}
