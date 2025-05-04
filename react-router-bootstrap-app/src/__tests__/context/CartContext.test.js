import { renderHook, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '../../context/CartContext';
import { UserProvider } from '../../context/UserContext';

let mockCart = [];
let fetchCallCount = 0;

beforeEach(() => {
  mockCart = [];
  fetchCallCount = 0;

  global.fetch = jest.fn((url, options) => {
    // First GET to load initial cart
    if (url.endsWith('/api/cart') && (!options || options.method === 'GET')) {
      fetchCallCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCart),
      });
    }

    // POST to add new cart item
    if (url.endsWith('/api/cart') && options?.method === 'POST') {
      mockCart.push({ id: 1, kit_id: 42, quantity: 1 });
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCart), // usually returns new item or nothing
      });
    }

    // PUT to update quantity
    if (url.includes('/api/cart/') && options?.method === 'PUT') {
      const id = parseInt(url.split('/').pop());
      const body = JSON.parse(options.body);
      mockCart = mockCart.map(item => item.id === id ? { ...item, quantity: body.quantity } : item);
      return Promise.resolve({ ok: true });
    }

    // DELETE to remove from cart
    if (url.includes('/api/cart/') && options?.method === 'DELETE') {
      const id = parseInt(url.split('/').pop());
      mockCart = mockCart.filter(item => item.id !== id);
      return Promise.resolve({ ok: true });
    }

    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });
});

describe('CartContext', () => {
  it('adds, updates, and removes items', async () => {
    const wrapper = ({ children }) => (
      <UserProvider value={{ currentUser: { id: 1, username: 'test' } }}>
        <CartProvider>{children}</CartProvider>
      </UserProvider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart({ id: 42, name: 'Kit A' });
    });

    await waitFor(() =>
      expect(result.current.cart).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kit_id: 42, quantity: 1 }),
        ])
      )
    );

    await act(async () => {
      await result.current.updateQuantity(1, 3);
    });

    await waitFor(() => expect(result.current.cart[0].quantity).toBe(3));

    await act(async () => {
      await result.current.removeFromCart(1);
    });

    await waitFor(() => expect(result.current.cart).toEqual([]));
  });
});
