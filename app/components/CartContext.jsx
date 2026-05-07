'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // load
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedFavorites = localStorage.getItem('favorites');
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  //save localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // favorite localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  //Add to cart
  const addToCart = (product) => {
    setCart(prev => {
      const identifier = product.cartKey || product.id;
      const exists = prev.find(item => (item.cartKey || item.id) === identifier);
      if (exists) {
        return prev.map(item =>
          (item.cartKey || item.id) === identifier
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, cartKey: identifier }];
    });
  };

  //Remove 
  const removeFromCart = (cartKeyOrId) => {
    setCart(prev => prev.filter(item => (item.cartKey || item.id) !== cartKeyOrId));
  };

  //update
  const updateQuantity = (cartKeyOrId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKeyOrId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        (item.cartKey || item.id) === cartKeyOrId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

 // Add/Remove from Favorites
  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Check if the product is in your favorites
  const isFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  // Calculating the total number
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = favorites.length;

  const value = {
    cart,
    favorites,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleFavorite,
    isFavorite,
    cartCount,
    favoritesCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}