const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require('./ecommerce-app-4fbb9-firebase-adminsdk-fbsvc-f35a170d34.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'ecommerce-app-4fbb9.firebasestorage.app'
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.log('⚠️  Firebase Admin SDK initialization failed, using fallback mode');
  console.log('   Error:', error.message);
}

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/users', require('./routes/users'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    firebase: admin.apps.length > 0 ? 'Connected' : 'Not connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase Admin SDK: ${admin.apps.length > 0 ? 'Connected' : 'Fallback mode'}`);
});

module.exports = app; 