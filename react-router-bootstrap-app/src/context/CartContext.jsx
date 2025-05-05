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
      fetch(`${API_BASE}/api/cart`, {
        headers: { 'Content-Type': 'application/json' },
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
          setCart([]);
        });
    } else {
      setCart([]);
    }
  }, [currentUser, API_BASE]);

  const addToCart = async (kit, inventory_id = null) => {
    if (!currentUser) {
      alert('Please log in to add items to your cart.');
      return;
    }

    try {
      if (!inventory_id) {
        const res = await fetch(`${API_BASE}/api/inventory/${kit.id}`, {
          credentials: 'include',
        });
        const inventories = await res.json();
        console.log(inventories);
        const available = inventories.filter(inv => inv.quantity > 0);

        if (available.length === 0) {
          alert('This kit is currently out of stock at all locations.');
          return;
        } else if (available.length === 1) {
          inventory_id = available[0].id;
        } else {
          const choice = window.prompt(
            'Please choose a location:\n' +
              available.map((inv, i) => `${i + 1}. ${inv.location_name} (${inv.quantity} available)`).join('\n')
          );

          const index = parseInt(choice);
          if (isNaN(index) || index < 1 || index > available.length) {
            alert('Invalid selection. Kit not added to cart.');
            return;
          }

          inventory_id = available[index - 1].id;
          console.log(index);
          console.log(available);
        }
      }

      const existing = cart.find(item => item.kit_id === kit.id && item.inventory_id === inventory_id);

      if (existing) {
        const updated = cart.map(item =>
          item.kit_id === kit.id && item.inventory_id === inventory_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        setCart(updated);

        await fetch(`${API_BASE}/api/cart/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ quantity: existing.quantity + 1 }),
        });
      } else {
        const newItem = { kit_id: kit.id, quantity: 1, inventory_id };
        await fetch(`${API_BASE}/api/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newItem),
        });

        const updatedCart = await fetch(`${API_BASE}/api/cart`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json());

        setCart(updatedCart);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart.');
    }
  };

  const updateQuantity = (id, quantity) => {
    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCart(updated);

    fetch(`${API_BASE}/api/cart/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ quantity }),
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));

    fetch(`${API_BASE}/api/cart/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  };

  const clearCart = () => {
    setCart([]);

    fetch(`${API_BASE}/api/cart/all`, {
      method: 'DELETE',
      credentials: 'include',
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
