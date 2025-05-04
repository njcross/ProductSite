import { RouterProvider } from 'react-router-dom';
import { router } from './router';

import { useEffect, useState } from 'react';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { ContentContext } from './context/ContentContext';
import { FavoritesProvider } from './context/FavoritesContext';

import HeaderBar from './components/HeaderBar';
import Navbar from './components/Navbar';
import { FooterNav } from './components/FooterNav';
import { FooterNewsletter } from './components/FooterNewsletter';

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
            <div className="app-container">
              <HeaderBar />
              <Navbar />
              <RouterProvider router={router} />
              <FooterNewsletter />
              <FooterNav />
            </div>
          </ContentContext.Provider>
        </CartProvider>
      </FavoritesProvider>
    </UserProvider>
  );
}
