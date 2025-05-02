import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';

describe('CartContext', () => {
  it('adds, removes, and updates items', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({ id: 1, name: 'Kit A', quantity: 1 });
    });

    expect(result.current.cart.length).toBe(1);

    act(() => {
      result.current.updateQuantity(1, 3);
    });

    expect(result.current.cart[0].quantity).toBe(3);

    act(() => {
      result.current.removeFromCart(1);
    });

    expect(result.current.cart.length).toBe(0);
  });
});