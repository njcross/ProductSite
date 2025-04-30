// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { currentUser } = useUser();
  const [cart, setCart] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (currentUser) {
      fetch(`/api/cart`, {
        headers: { 'ngrok-skip-browser-warning': 'true', credentials: 'include', 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCart(data);
          } else {
            console.error('Cart data is not an array:', data);
            setCart([]);
          }
        })
        .catch(err => {
          console.error('Error loading cart:', err);
          setCart([]); // fallback
        });
    } else {
      setCart([]); // clear cart on logout
    }
  }, [currentUser, API_BASE]);

  const addToCart = (character) => {
    const existing = cart.find(item => item.character_id === character.id);
    if (existing) {
      const updated = cart.map(item =>
        item.character_id === character.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updated);

      fetch(`/api/cart/${existing.id}`, {
        method: 'PUT',
        headers: { 'ngrok-skip-browser-warning': 'true', credentials: 'include', 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: existing.quantity + 1 }),
      });
    } else {
      const newItem = { character_id: character.id, quantity: 1 };
      fetch(`/api/cart`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true', credentials: 'include', 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newItem),
      })
        .then(res => res.json())
        .then(() => {
          // Refetch the cart to get ID assigned from backend
          return fetch(`/api/cart`, { credentials: 'include',
            headers: { 'ngrok-skip-browser-warning': 'true', credentials: 'include', 'Content-Type': 'application/json' } });
        })
        .then(res => res.json())
        .then(data => setCart(data));
    }
  };

  const updateQuantity = (id, quantity) => {
    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCart(updated);

    fetch(`/api/cart/${id}`, {
      method: 'PUT',
      headers: { 'ngrok-skip-browser-warning': 'true', credentials: 'include', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ quantity }),
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));

    fetch(`/api/cart/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
