import { renderHook, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '../../context/CartContext';
import { UserProvider } from '../../context/UserContext';
import { createCartMock } from '../../testing/Mocks/CreateCartMock';

let fetchCallCount;

beforeEach(() => {
  const { fetch_mock, mock_cart_state, fetchCallCount: getFetchCallCount } = createCartMock();
  global.fetch = fetch_mock;
  fetchCallCount = getFetchCallCount; // assign the getter function
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
    
    await waitFor(() => {
      // Refetch cart triggered in context after POST needs to complete
      expect(fetchCallCount()).toBeGreaterThan(1); // optional debug check
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
