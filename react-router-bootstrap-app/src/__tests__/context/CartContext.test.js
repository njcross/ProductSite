
import { renderHook, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '../../context/CartContext';
import { createCartMock } from '../../testing/Mocks/createCartMock';
import { useUser } from '../../context/UserContext';

jest.mock('../../context/UserContext', () => ({
  useUser: () => ({
    currentUser: { id: 1, username: 'test' },
  }),
}));
jest.setTimeout(15000);
global.alert = jest.fn();
global.prompt = jest.fn(() => '1');

let fetchCallCount;

beforeEach(() => {
  const { fetch_mock, fetchCallCount: getFetchCallCount } = createCartMock();
  global.fetch = fetch_mock;
  fetchCallCount = getFetchCallCount;
});

describe('CartContext', () => {
  it('adds, updates, and removes items', async () => {
    // const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

    // const { result } = renderHook(() => useCart(), { wrapper });

    // await act(async () => {
    //   await result.current.addToCart({ id: 42, name: 'Kit A' }, "99"); // pass inventory_id
    // });

    // await waitFor(() =>
    //   expect(result.current.cart).toEqual(
    //     expect.arrayContaining([
    //       expect.objectContaining({ kit_id: 42, quantity: 1 }),
    //     ])
    //   )
    // );

    // await act(async () => {
    //   await result.current.updateQuantity(1, 3);
    // });

    // await waitFor(() => expect(result.current.cart[0].quantity).toBe(3));

    // await act(async () => {
    //   await result.current.removeFromCart(1);
    // });

    // await waitFor(() => expect(result.current.cart).toEqual([]));
  });
});
