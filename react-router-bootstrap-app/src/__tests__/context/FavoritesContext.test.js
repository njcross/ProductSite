import { renderHook, act } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from '../context/FavoritesContext';

describe('FavoritesContext', () => {
  it('adds and removes favorites', () => {
    const wrapper = ({ children }) => <FavoritesProvider>{children}</FavoritesProvider>;
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite(42);
    });

    expect(result.current.favorites).toContain(42);

    act(() => {
      result.current.removeFavorite(42);
    });

    expect(result.current.favorites).not.toContain(42);
  });
});