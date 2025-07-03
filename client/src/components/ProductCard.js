import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onAddToCart, onEdit, onDelete, showActions = true }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isItemInCart, getItemQuantity } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Could show a login modal here
      return;
    }
    
    await addToCart(product.id);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const isOwner = user?.uid === product.createdBy;
  const isInCart = isItemInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden product-card">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        {imageLoading && (
          <div className="absolute inset-0 image-placeholder" />
        )}
        {!imageError && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        
        {/* Action Buttons */}
        {showActions && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <Link
              to={`/products/${product.id}`}
              className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </Link>
            
            {(isOwner || user?.role === 'admin') && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit?.(product);
                  }}
                  className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete?.(product);
                  }}
                  className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
            product.category === 'shirt' ? 'bg-blue-100 text-blue-800' :
            product.category === 'shoes' ? 'bg-purple-100 text-purple-800' :
            'bg-green-100 text-green-800'
          }`}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            ${product.price.toFixed(2)}
          </span>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              {isInCart && (
                <span className="text-xs text-gray-500">
                  In cart: {cartQuantity}
                </span>
              )}
              <button
                onClick={handleAddToCart}
                disabled={!isAuthenticated}
                className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  isAuthenticated
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                {isInCart ? 'Added' : 'Add'}
              </button>
            </div>
          )}
        </div>
        
        {/* Product Meta */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Added {new Date(product.createdAt).toLocaleDateString()}</span>
            {product.createdBy && (
              <span className="truncate">
                by {product.createdBy === user?.uid || product.createdBy === user?.username ? 'You' : product.createdBy}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 