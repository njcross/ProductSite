import { renderWithProviders } from '../../testing/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import FavoriteButton from '../../components/FavoriteButton';
import { FavoritesProvider } from '../../context/FavoritesContext';

describe('FavoriteButton', () => {
  test('toggles favorite state', () => {
    const { getByRole } = renderWithProviders(
      <FavoritesProvider>
        <FavoriteButton characterId={1} />
      </FavoritesProvider>
    );
    fireEvent.click(getByRole('button'));
  });
});
