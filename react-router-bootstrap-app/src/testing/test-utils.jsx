// test-utils.jsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { ContentContext } from '../context/ContentContext';
import { useState } from 'react';
import React from 'react';

const AllProviders = ({ children }) => {
  const [content, setContent] = useState({});

  return (
    <BrowserRouter>
      <UserProvider>
        <CartProvider>
          <FavoritesProvider>
            <ContentContext.Provider value={{ content, setContent }}>
              {children}
            </ContentContext.Provider>
          </FavoritesProvider>
        </CartProvider>
      </UserProvider>
    </BrowserRouter>
  );
};
const customRender = (ui, options) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
