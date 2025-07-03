const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Check if Firebase Admin SDK is available
const isFirebaseAvailable = admin.apps.length > 0;

// Predefined admin and cashier accounts with case-insensitive passwords
const PREDEFINED_ACCOUNTS = {
  'admin': {
    uid: 'admin-uid',
    email: 'admin@admin.com',
    username: 'admin',
    password: 'admin123',
    name: 'Admin',
    role: 'admin'
  },
  'cashier': {
    uid: 'cashier-uid',
    email: 'cashier@cashier.com',
    username: 'cashier',
    password: 'cashier123',
    name: 'Cashier',
    role: 'cashier'
  }
};

// Mock users storage for registered users
let registeredUsers = {};

// Helper function to check password (case-insensitive)
const checkPassword = (inputPassword, storedPassword) => {
  return inputPassword.toLowerCase() === storedPassword.toLowerCase();
};

// Simple token generation
const generateToken = (userData) => {
  return Buffer.from(JSON.stringify({
    uid: userData.uid,
    role: userData.role,
    email: userData.email,
    username: userData.username,
    name: userData.name,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  })).toString('base64');
};

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

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if it's a predefined account
    if (PREDEFINED_ACCOUNTS[email] || PREDEFINED_ACCOUNTS[name.toLowerCase()]) {
      return res.status(400).json({ error: 'This email or username is reserved for system accounts' });
    }

    // Check if user already exists
    if (registeredUsers[email]) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = {
      uid: `user-${Date.now()}`,
      email: email,
      username: name.toLowerCase(),
      password: password,
      name: name,
      role: 'user',
      createdAt: new Date()
    };

    registeredUsers[email] = newUser;

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        uid: newUser.uid,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role
      },
      token: token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Check predefined accounts first (fallback mode)
    let user = null;
    if (username && PREDEFINED_ACCOUNTS[username]) {
      user = PREDEFINED_ACCOUNTS[username];
    } else if (email && PREDEFINED_ACCOUNTS[email]) {
      user = PREDEFINED_ACCOUNTS[email];
    }

    if (user) {
      // Check password case-insensitively
      if (!checkPassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create user data
      const userData = {
        uid: user.uid,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        updatedAt: new Date()
      };

      // Generate simple token
      const token = generateToken(userData);
      
      res.json({
        message: 'Login successful (fallback mode)',
        user: userData,
        token: token
      });
      return;
    }

    // Try Firebase Authentication if available
    if (isFirebaseAvailable && email) {
      try {
        // Sign in with Firebase
        const userRecord = await admin.auth().getUserByEmail(email);
        
        // For now, we'll use the predefined accounts for Firebase too
        // In a real app, you'd verify the password with Firebase Auth
        const userData = {
          uid: userRecord.uid,
          email: userRecord.email,
          username: userRecord.displayName || email.split('@')[0],
          name: userRecord.displayName || email.split('@')[0],
          role: 'user', // Default role
          updatedAt: new Date()
        };

        const token = generateToken(userData);
        
        res.json({
          message: 'Login successful (Firebase)',
          user: userData,
          token: token
        });
        return;
      } catch (firebaseError) {
        console.log('Firebase auth failed, trying fallback:', firebaseError.message);
      }
    }

    // Check registered users (fallback)
    if (email && registeredUsers[email]) {
      user = registeredUsers[email];
    } else if (username) {
      // Find user by username
      user = Object.values(registeredUsers).find(u => u.username === username);
    }

    if (user && checkPassword(password, user.password)) {
      const userData = {
        uid: user.uid,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        updatedAt: new Date()
      };

      const token = generateToken(userData);
      
      res.json({
        message: 'Login successful (fallback)',
        user: userData,
        token: token
      });
      return;
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

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

    res.json({ user: { id: userData.uid, ...userData } });
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
    if (PREDEFINED_ACCOUNTS[email]) {
      return res.status(400).json({ error: 'Cannot update system accounts' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Firebase token endpoint
router.post('/firebase-token', async (req, res) => {
  try {
    const { uid, email } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: 'UID and email are required' });
    }

    // Create user data
    const userData = {
      uid: uid,
      email: email,
      username: email.split('@')[0],
      name: email.split('@')[0],
      role: 'user', // Default role
      updatedAt: new Date()
    };

    // Generate custom token
    const token = generateToken(userData);
    
    res.json({
      message: 'Firebase token generated',
      user: userData,
      token: token
    });
  } catch (error) {
    console.error('Firebase token error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router; 