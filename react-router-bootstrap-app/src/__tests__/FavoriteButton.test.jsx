import { render, fireEvent, screen } from '@testing-library/react';
import FavoriteButton from '../components/FavoriteButton';
import { FavoritesContext } from '../context/FavoritesContext'; // Make sure path is correct!
import { BrowserRouter } from 'react-router-dom';

const MockFavoritesProvider = ({ children }) => {
  const toggleFavorite = jest.fn();
  const favorites = [1];

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

test('toggles favorite state', () => {
  render(
    <BrowserRouter>
      <MockFavoritesProvider>
        <FavoriteButton characterId={1} />
      </MockFavoritesProvider>
    </BrowserRouter>
  );

  const button = screen.getByRole('button');
  fireEvent.click(button);
});
