import { createContext, useState, useContext } from 'react';
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (character) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === character.id);
      return exists
        ? prev.map(item => item.id === character.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...character, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);