import { renderWithProviders } from '../../testing/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import FavoriteFiltersDropdown from '../../components/FavoriteFiltersDropdown';
import { FavoritesContext } from '../../context/FavoritesContext';

describe('FavoriteFiltersDropdown', () => {
  const mockRemove = jest.fn();
  const mockApply = jest.fn();

  const renderWithContext = (filters = []) => {
    renderWithProviders(
      <FavoritesContext.Provider value={{
        favoriteFilters: filters,
        removeFavoriteFilter: mockRemove
      }}>
        <FavoriteFiltersDropdown onApply={mockApply} />
      </FavoritesContext.Provider>
    );
  };

  test('renders message when no favorite filters exist', () => {
    renderWithContext([]);
    expect(screen.getByText(/no saved filters/i)).toBeInTheDocument();
  });

  test('renders favorite filters and handles click', () => {
    const filters = [{ name: 'Filter A' }, { name: 'Filter B' }];
    renderWithContext(filters);

    expect(screen.getByText('Filter A')).toBeInTheDocument();
    expect(screen.getByText('Filter B')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Filter A'));
    expect(mockApply).toHaveBeenCalledWith(filters[0]);
  });

  test('calls removeFavoriteFilter on delete click', () => {
    const filters = [{ name: 'Filter A' }];
    renderWithContext(filters);

    fireEvent.click(screen.getByText('×'));
    expect(mockRemove).toHaveBeenCalledWith(0);
  });
});
