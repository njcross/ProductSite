// src/testing/test-utils.jsx
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { ContentContext } from '../context/ContentContext';
import React, { useState } from 'react';

/**
 * Renders a component within the same provider setup as App.jsx
 */
export const renderWithProviders = (
  ui,
  {
    route = '/',
    content = {},
    routes = [{ path: route, element: ui }]
  } = {}
) => {
  const router = createMemoryRouter(routes, {
    initialEntries: [route],
    future: { v7_relativeSplatPath: true }, // optional if you're using this in production
  });

  const Wrapper = ({ children }) => {
    const [contentState, setContent] = useState(content);

    return (
      <UserProvider>
        <FavoritesProvider>
          <CartProvider>
            <ContentContext.Provider value={{ content: contentState, setContent }}>
              <RouterProvider router={router} />
            </ContentContext.Provider>
          </CartProvider>
        </FavoritesProvider>
      </UserProvider>
    );
  };

  return render(<Wrapper>{ui}</Wrapper>);
};
