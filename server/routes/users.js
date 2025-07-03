const express = require('express');
const { requireAdmin, requireAdminOrCashier } = require('../middleware/auth');
const router = express.Router();

// Simple token verification
const verifyToken = (token) => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp < Date.now()) {
      return null; // Token expired
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

// Predefined accounts for demo
const PREDEFINED_ACCOUNTS = {
  'admin-uid': {
    uid: 'admin-uid',
    email: 'admin@admin.com',
    name: 'Admin',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  'cashier-uid': {
    uid: 'cashier-uid',
    email: 'cashier@cashier.com',
    name: 'Cashier',
    role: 'cashier',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
};

// Mock data for demo
const MOCK_PURCHASES = [
  {
    id: 'purchase-1',
    userId: 'user-1',
    userEmail: 'customer@example.com',
    userName: 'John Customer',
    items: [
      { name: 'T-Shirt', price: 25.99, quantity: 2 },
      { name: 'Jeans', price: 49.99, quantity: 1 }
    ],
    total: 101.97,
    status: 'completed',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'purchase-2',
    userId: 'user-2',
    userEmail: 'jane@example.com',
    userName: 'Jane Smith',
    items: [
      { name: 'Dress', price: 79.99, quantity: 1 }
    ],
    total: 79.99,
    status: 'pending',
    createdAt: new Date('2024-01-16')
  }
];

const MOCK_PRODUCTS = [
  {
    id: 'product-1',
    name: 'T-Shirt',
    price: 25.99,
    description: 'Comfortable cotton t-shirt',
    createdBy: 'admin-uid',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'product-2',
    name: 'Jeans',
    price: 49.99,
    description: 'Classic blue jeans',
    createdBy: 'admin-uid',
    createdAt: new Date('2024-01-02')
  }
];

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const userData = verifyToken(token);
    if (!userData) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user from predefined accounts
    const user = PREDEFINED_ACCOUNTS[userData.uid];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: { id: user.uid, ...user } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const userData = verifyToken(token);
    if (!userData) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { name, email, phone, address } = req.body;

    // Don't allow updating predefined accounts
    if (email === 'admin@admin.com' || email === 'cashier@cashier.com') {
      return res.status(400).json({ error: 'Cannot update system accounts' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = Object.values(PREDEFINED_ACCOUNTS);
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (admin only)
router.get('/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = PREDEFINED_ACCOUNTS[userId];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: { id: user.uid, ...user } });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create cashier (admin only) - Mock implementation
router.post('/cashiers', requireAdmin, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Mock cashier creation
    const newCashierId = `cashier-${Date.now()}`;
    const newCashier = {
      uid: newCashierId,
      email,
      name,
      role: 'cashier',
      createdBy: req.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      message: 'Cashier created successfully',
      cashier: newCashier
    });
  } catch (error) {
    console.error('Create cashier error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user role (admin only) - Mock implementation
router.put('/:userId/role', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'cashier', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Mock role update
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user (admin only) - Mock implementation
router.delete('/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Mock user deletion
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all purchases (admin and cashier)
router.get('/purchases/all', requireAdminOrCashier, async (req, res) => {
  try {
    res.json({ purchases: MOCK_PURCHASES });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Get purchase by ID (admin and cashier)
router.get('/purchases/:purchaseId', requireAdminOrCashier, async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const purchase = MOCK_PURCHASES.find(p => p.id === purchaseId);
    
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json({ purchase });
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({ error: 'Failed to fetch purchase' });
  }
});

// Get user activity (admin only)
router.get('/:userId/activity', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's purchases (mock data)
    const purchases = MOCK_PURCHASES.filter(p => p.userId === userId);
    
    // Get user's products (mock data)
    const products = MOCK_PRODUCTS.filter(p => p.createdBy === userId);

    res.json({ 
      purchases,
      products,
      totalPurchases: purchases.length,
      totalProducts: products.length
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

module.exports = router; 