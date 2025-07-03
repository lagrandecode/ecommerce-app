const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock carts data
let carts = {};

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.username;
    
    if (!carts[userId]) {
      // Create empty cart if it doesn't exist
      carts[userId] = {
        items: [],
        updatedAt: new Date()
      };
    }

    const cartData = carts[userId];
    const items = cartData.items || [];

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      items,
      total: parseFloat(total.toFixed(2))
    });

  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.uid || req.user.username;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    // Mock product data (in a real app, this would come from the products collection)
    const mockProducts = {
      '1': { title: 'Classic White T-Shirt', price: 25.99, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
      '2': { title: 'Blue Denim Shirt', price: 45.99, imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400' },
      '3': { title: 'Running Shoes', price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
      '4': { title: 'Casual Sneakers', price: 65.99, imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400' },
      '5': { title: 'Leather Wallet', price: 35.99, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400' }
    };

    const product = mockProducts[productId];
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Initialize cart if it doesn't exist
    if (!carts[userId]) {
      carts[userId] = {
        items: [],
        updatedAt: new Date()
      };
    }

    let cartItems = carts[userId].items || [];

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.productId === productId);

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cartItems.push({
        productId,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity,
        addedAt: new Date()
      });
    }

    // Update cart
    carts[userId] = {
      items: cartItems,
      updatedAt: new Date()
    };

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      message: 'Item added to cart successfully',
      items: cartItems,
      total: parseFloat(total.toFixed(2))
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.uid || req.user.username;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    if (!carts[userId]) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    let cartItems = carts[userId].items || [];
    const itemIndex = cartItems.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Update quantity
    cartItems[itemIndex].quantity = quantity;

    // Update cart
    carts[userId] = {
      items: cartItems,
      updatedAt: new Date()
    };

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      message: 'Cart updated successfully',
      items: cartItems,
      total: parseFloat(total.toFixed(2))
    });

  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.uid || req.user.username;

    if (!carts[userId]) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    let cartItems = carts[userId].items || [];
    const itemIndex = cartItems.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Remove item
    cartItems.splice(itemIndex, 1);

    // Update cart
    carts[userId] = {
      items: cartItems,
      updatedAt: new Date()
    };

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      message: 'Item removed from cart successfully',
      items: cartItems,
      total: parseFloat(total.toFixed(2))
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.username;

    if (!carts[userId]) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Clear cart
    carts[userId] = {
      items: [],
      updatedAt: new Date()
    };

    res.json({
      message: 'Cart cleared successfully',
      items: [],
      total: 0
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router; 