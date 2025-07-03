const express = require('express');
const { authenticateToken, requireAdmin, requireOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Mock products data
let products = [
  {
    id: '1',
    title: 'Classic White T-Shirt',
    description: 'Comfortable cotton t-shirt perfect for everyday wear',
    price: 25.99,
    category: 'shirt',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    createdBy: 'admin',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Blue Denim Shirt',
    description: 'Stylish denim shirt for a casual look',
    price: 45.99,
    category: 'shirt',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400',
    createdBy: 'admin',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '3',
    title: 'Running Shoes',
    description: 'Comfortable running shoes for athletes',
    price: 89.99,
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    createdBy: 'admin',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: '4',
    title: 'Casual Sneakers',
    description: 'Trendy sneakers for everyday style',
    price: 65.99,
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
    createdBy: 'admin',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '5',
    title: 'Leather Wallet',
    description: 'Premium leather wallet with multiple card slots',
    price: 35.99,
    category: 'others',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
    createdBy: 'admin',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  }
];

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let filteredProducts = [...products];

    // Apply category filter
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    res.json(filteredProducts);

  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);

  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product (Admin, Cashier, or Worker)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Only allow admin or cashier to add products
    if (req.user.role !== 'admin' && req.user.role !== 'cashier') {
      return res.status(403).json({ error: 'Only admin or cashier can add products' });
    }

    const { title, description, price, category, imageUrl } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ 
        error: 'Title, description, price, and category are required' 
      });
    }

    if (!['shirt', 'shoes', 'others'].includes(category)) {
      return res.status(400).json({ 
        error: 'Category must be shirt, shoes, or others' 
      });
    }

    const newProduct = {
      id: Date.now().toString(),
      title,
      description,
      price: parseFloat(price),
      category,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      createdBy: req.user.uid || req.user.username,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    products.push(newProduct);

    res.status(201).json(newProduct);

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (Admin or Owner)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, imageUrl } = req.body;

    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[productIndex];

    // Check permissions (admin or owner)
    if (req.user.role !== 'admin' && product.createdBy !== req.user.uid && product.createdBy !== req.user.username) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (price) updates.price = parseFloat(price);
    if (category) {
      if (!['shirt', 'shoes', 'others'].includes(category)) {
        return res.status(400).json({ 
          error: 'Category must be shirt, shoes, or others' 
        });
      }
      updates.category = category;
    }
    if (imageUrl) updates.imageUrl = imageUrl;

    updates.updatedAt = new Date();

    products[productIndex] = { ...product, ...updates };

    res.json(products[productIndex]);

  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (Admin or Owner)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[productIndex];

    // Check permissions (admin or owner)
    if (req.user.role !== 'admin' && product.createdBy !== req.user.uid && product.createdBy !== req.user.username) {
      return res.status(403).json({ error: 'Access denied' });
    }

    products.splice(productIndex, 1);

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router; 