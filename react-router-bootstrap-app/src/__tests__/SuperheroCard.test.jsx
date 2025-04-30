import { render, screen } from '@testing-library/react';
import SuperheroCard from '../components/SuperheroCard';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { UserProvider } from '../context/UserContext';
import { FavoritesProvider } from '../context/FavoritesContext';
jest.mock('../context/UserContext', () => ({
  useUser: () => ({
    currentUser: { id: 1, username: 'testuser' }, // mock whatever fields you need
  }),
}));
test('displays character details', () => {
  const character = {
    id: 1,
    name: 'Iron Man',
    alias: 'Tony Stark',
    powers: 'Powered armor suit',
    image_url: 'http://example.com/ironman.jpg',
    price: 5.0,
  };

  render(
    <BrowserRouter>
      <CartProvider>
        <FavoritesProvider>
          <SuperheroCard character={character} />
        </FavoritesProvider>
      </CartProvider>
    </BrowserRouter>
  );
  
  

  expect(screen.getByText(/iron man/i)).toBeInTheDocument();
  expect(screen.getByText(/tony stark/i)).toBeInTheDocument();
});
