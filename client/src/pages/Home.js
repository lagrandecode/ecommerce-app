import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShoppingBag, Users, Star, TrendingUp } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productService.getProducts({ 
          sortBy: 'createdAt', 
          sortOrder: 'desc',
          limit: 8 
        });
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }
    await addToCart(productId);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Fashion Store
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Discover the latest trends in clothing and accessories. 
              Buy and sell fashion items with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Products
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Start Selling
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Fashion Store?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the best in online fashion commerce
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Shopping</h3>
              <p className="text-gray-600">
                Browse through thousands of products with our intuitive interface
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Join our community of fashion enthusiasts and sellers
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600">
                Every product is verified for quality and authenticity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-gray-600">
                Discover the latest additions to our collection
              </p>
            </div>
            <Link
              to="/products"
              className="flex items-center text-primary-600 hover:text-primary-700 font-semibold"
            >
              View All
              <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {!loading && featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products available yet.</p>
              {isAuthenticated && (
                <Link
                  to="/my-products"
                  className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Your First Product
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find exactly what you're looking for
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/products?category=shirt"
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-64 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Shirts</h3>
                  <p className="text-blue-100">Casual and formal shirts</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/products?category=shoes"
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 h-64 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Shoes</h3>
                  <p className="text-purple-100">Footwear for every occasion</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/products?category=others"
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-br from-green-400 to-green-600 h-64 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Others</h3>
                  <p className="text-green-100">Accessories and more</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Fashion Journey?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of users buying and selling fashion items
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 