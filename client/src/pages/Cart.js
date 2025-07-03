import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, clearCart, checkout } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
    } else {
      await updateCartItem(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    try {
      await checkout();
      navigate('/purchases');
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your cart.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to="/products"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Continue Shopping
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Cart Items ({cart.items.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="p-6">
                      <div className="flex items-center">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.title}
                          </h3>
                          <p className="text-lg font-bold text-primary-600">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="p-1 rounded-md hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center text-lg font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="p-1 rounded-md hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear Cart Button */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Clear all items
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.items.length === 0}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  This is a demo checkout. No real payment will be processed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 