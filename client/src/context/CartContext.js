import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch cart from server
  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total: 0 });
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Cart fetch error:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/cart/add', { productId, quantity });
      setCart(response.data);
      toast.success('Item added to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      const message = error.response?.data?.error || 'Failed to add item to cart';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await api.put('/cart/update', { productId, quantity });
      setCart(response.data);
      toast.success('Cart updated');
    } catch (error) {
      console.error('Cart update error:', error);
      const message = error.response?.data?.error || 'Failed to update cart';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await api.delete(`/cart/remove/${productId}`);
      setCart(response.data);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Remove from cart error:', error);
      const message = error.response?.data?.error || 'Failed to remove item from cart';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await api.delete('/cart/clear');
      setCart(response.data);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Clear cart error:', error);
      const message = error.response?.data?.error || 'Failed to clear cart';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Checkout
  const checkout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/cart/checkout');
      setCart({ items: [], total: 0 });
      toast.success('Purchase completed successfully!');
      return response.data;
    } catch (error) {
      console.error('Checkout error:', error);
      const message = error.response?.data?.error || 'Checkout failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if item is in cart
  const isItemInCart = (productId) => {
    return cart.items.some(item => item.productId === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  // Fetch cart when authentication state changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    fetchCart,
    getCartItemCount,
    isItemInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 