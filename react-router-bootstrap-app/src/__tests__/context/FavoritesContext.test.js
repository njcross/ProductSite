import { renderHook, act } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from '../../context/FavoritesContext';
import { UserProvider } from '../../context/UserContext';

describe('FavoritesContext', () => {
  let fetchFavoritesCallCount = 0;
  beforeEach(() => {
    fetchFavoritesCallCount = 0;
    global.fetch = jest.fn((url, options) => {
      if (url.endsWith('/api/favorites/') && (!options || options.method === 'GET')) {
        fetchFavoritesCallCount++;
        const response = fetchFavoritesCallCount === 2
          ? []   // First call returns item
          : [{ kit_id: 42 }];                // Second call returns empty
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
        });
      }
  
      // Mock POST /api/favorites/
      if (url.endsWith('/api/favorites/') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }

      if (url.includes('/api/favorites/character/') && options?.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });

  it('adds and removes favorites', async () => {
    const wrapper = ({ children }) => (
      <UserProvider value={{ currentUser: { id: 1 } }}>
        <FavoritesProvider>{children}</FavoritesProvider>
      </UserProvider>
    );

    const { result, waitForNextUpdate } = renderHook(() => useFavorites(), { wrapper });

    await act(async () => {
      await result.current.toggleFavorite(42); // will POST
    });

    expect(result.current.favorites).toContain(42);

    await act(async () => {
      await result.current.removeFavorite(42); // will DELETE
    });

    expect(result.current.favorites).not.toContain(42);
  });
});
