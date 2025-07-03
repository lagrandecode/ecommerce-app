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

// Middleware to authenticate requests
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to require admin role
const requireAdmin = async (req, res, next) => {
  try {
    await authenticateToken(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to require admin or cashier role
const requireAdminOrCashier = async (req, res, next) => {
  try {
    await authenticateToken(req, res, () => {
      if (req.user.role !== 'admin' && req.user.role !== 'cashier') {
        return res.status(403).json({ error: 'Admin or cashier access required' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user is owner or admin
const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admin can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // For other operations, check if user is the owner
  if (req.params.userId && req.params.userId !== req.user.uid) {
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
};

// Middleware to check if user is authenticated (basic check)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrCashier,
  requireOwnerOrAdmin,
  requireAuth
}; 