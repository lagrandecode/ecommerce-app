import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access');
    }
    
    if (error.response?.status === 403) {
      // Handle forbidden access
      console.log('Access forbidden');
    }
    
    return Promise.reject(error);
  }
);

// API service functions
export const productService = {
  // Get all products
  getProducts: (params = {}) => api.get('/products', { params }),
  
  // Get product by ID
  getProduct: (id) => api.get(`/products/${id}`),
  
  // Create product
  createProduct: (data) => api.post('/products', data),
  
  // Update product
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Get user's products
  getUserProducts: (userId) => api.get(`/products/user/${userId}`)
};

export const cartService = {
  // Get cart
  getCart: () => api.get('/cart'),
  
  // Add to cart
  addToCart: (data) => api.post('/cart/add', data),
  
  // Update cart item
  updateCartItem: (data) => api.put('/cart/update', data),
  
  // Remove from cart
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  
  // Clear cart
  clearCart: () => api.delete('/cart/clear'),
  
  // Checkout
  checkout: () => api.post('/cart/checkout'),
  
  // Get purchase history
  getPurchases: () => api.get('/cart/purchases'),
  
  // Get purchase by ID
  getPurchase: (purchaseId) => api.get(`/cart/purchases/${purchaseId}`)
};

export const authService = {
  // Register
  register: (data) => api.post('/auth/register', data),
  
  // Login
  login: (data) => api.post('/auth/login', data),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Get profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update profile
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const userService = {
  // Get all users (admin only)
  getUsers: () => api.get('/users'),
  
  // Get user by ID (admin only)
  getUser: (userId) => api.get(`/users/${userId}`),
  
  // Update user role (admin only)
  updateUserRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
  
  // Get user's cart (admin only)
  getUserCart: (userId) => api.get(`/users/${userId}/cart`),
  
  // Get user's products (admin only)
  getUserProducts: (userId) => api.get(`/users/${userId}/products`),
  
  // Get user's purchases (admin only)
  getUserPurchases: (userId) => api.get(`/users/${userId}/purchases`),
  
  // Delete user (admin only)
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  
  // Get user's purchase history
  getPurchases: () => api.get('/users/purchases')
};

export default api; 