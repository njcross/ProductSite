import { render, fireEvent } from '@testing-library/react';
import FavoriteButton from '../components/FavoriteButton';
import { FavoritesContext } from '../context/FavoritesContext';

test('toggles favorite state', () => {
  const toggleFavorite = jest.fn();
  const favorites = [1];

  const { getByRole } = render(
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      <FavoriteButton characterId={1} />
    </FavoritesContext.Provider>
  );

  fireEvent.click(getByRole('button'));
  expect(toggleFavorite).toHaveBeenCalledWith(1);
});
