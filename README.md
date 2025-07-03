# Clothing E-commerce System

A comprehensive clothing e-commerce platform built with React.js, Express.js, and Firebase.

## 🚀 Features

### Authentication
- Firebase Authentication (Email & Password)
- Login, Register, Logout functionality
- Protected routes with role-based access

### User Roles
- **Admin**: Full CRUD operations on all products, view user activities
- **Registered Users (Workers)**: Post items for sale, manage their listings, shopping cart

### Product Management
- Create, Read, Update, Delete products
- Image upload with Firebase Storage
- Category-based organization (shirt, shoes, others)
- User-specific product management

### Shopping Cart
- Add/remove items from cart
- Quantity management
- Dummy checkout simulation
- Purchase history tracking

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Express.js (Node.js)
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Storage (for images)
- **Hosting**: Vercel / Firebase Hosting (optional)

## 📦 Installation

1. Clone the repository
```bash
git clone <repository-url>
cd clothing-ecommerce-app
```

2. Install dependencies
```bash
npm run install-all
```

3. Set up Firebase
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Download service account key and save as `server/firebase-service-account.json`
   - Create `.env` file in the root directory

4. Configure environment variables
```bash
# .env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
PORT=5000
```

5. Start the development server
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
clothing-ecommerce-app/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/          # Configuration files
│   └── index.js         # Server entry point
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin/Worker)
- `PUT /api/products/:id` - Update product (Admin/Owner)
- `DELETE /api/products/:id` - Delete product (Admin/Owner)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `POST /api/cart/checkout` - Process checkout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/purchases` - Get purchase history

## 🎨 UI Components

The application uses Tailwind CSS for styling with a modern, responsive design. Key components include:

- Navigation bar with user authentication status
- Product grid with filtering and search
- Shopping cart sidebar
- Product detail modal
- Admin dashboard
- User profile management

## 🔒 Security Features

- Firebase Authentication for secure user management
- Role-based access control
- Protected API endpoints
- Input validation and sanitization
- Rate limiting on API endpoints

## 🚀 Deployment

### Frontend (Vercel)
1. Build the React app: `npm run build`
2. Deploy to Vercel or Firebase Hosting

### Backend (Heroku/Vercel)
1. Set environment variables
2. Deploy Express server

## 📝 License

MIT License - see LICENSE file for details 