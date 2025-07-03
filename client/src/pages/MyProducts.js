import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'shirt',
    imageUrl: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyProducts();
    }
  }, [isAuthenticated]);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      // Filter products created by the current user
      const myProducts = response.data.filter(product => 
        product.createdBy === user?.uid || product.createdBy === user?.username
      );
      setProducts(myProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      console.log('Submitting product data:', formData);
      
      if (editingProduct) {
        const response = await productService.updateProduct(editingProduct.id, formData);
        console.log('Update response:', response);
        toast.success('Product updated successfully!');
      } else {
        const response = await productService.createProduct(formData);
        console.log('Create response:', response);
        toast.success('Product added successfully!');
      }
      
      setShowAddForm(false);
      setEditingProduct(null);
      resetForm();
      fetchMyProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error details:', error.response?.data);
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to add product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
      try {
        await productService.deleteProduct(product.id);
        toast.success('Product deleted successfully!');
        fetchMyProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'shirt',
      imageUrl: ''
    });
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    resetForm();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Products</h1>
            <p className="text-gray-600">Please log in to manage your products.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
            <p className="text-gray-600">
              Manage your products and add new ones to the store
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>

        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter product title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="shirt">Shirt</option>
                  <option value="shoes">Shoes</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe your product..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showActions={false}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by adding your first product to the store.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts; 