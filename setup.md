# Clothing E-commerce System Setup Guide

This guide will help you set up the complete clothing e-commerce system with React frontend, Express backend, and Firebase integration.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Git

## Step 1: Clone and Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 2: Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Firebase Services**
   - **Authentication**: Go to Authentication > Sign-in method and enable Email/Password
   - **Firestore Database**: Go to Firestore Database > Create database (start in test mode)
   - **Storage**: Go to Storage > Get started (start in test mode)

3. **Get Firebase Configuration**
   - Go to Project Settings > Service accounts
   - Click "Generate new private key" to download the service account JSON
   - Rename it to `firebase-service-account.json` and place it in the `server/` directory

4. **Get Client Configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Copy the Firebase config object

## Step 3: Environment Configuration

1. **Create Backend Environment File**
   ```bash
   # In the root directory, create .env file
   cp env.example .env
   ```

   Edit `.env` with your Firebase credentials:
   ```env
   NODE_ENV=development
   PORT=5000
   
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase Private Key Here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email@your-project.iam.gserviceaccount.com
   ```

2. **Create Frontend Environment File**
   ```bash
   # In the client directory, create .env file
   cd client
   cp ../env.example .env
   ```

   Edit `client/.env` with your Firebase web config:
   ```env
   REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-firebase-app-id
   
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## Step 4: Firebase Security Rules

1. **Firestore Rules**
   Go to Firestore Database > Rules and update with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read all products
       match /products/{productId} {
         allow read: if true;
         allow write: if request.auth != null && 
           (request.auth.token.role == 'admin' || 
            resource.data.createdBy == request.auth.uid);
       }
       
       // Users can manage their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && 
           (request.auth.token.role == 'admin' || 
            request.auth.uid == userId);
       }
       
       // Users can manage their own cart
       match /carts/{userId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == userId;
       }
       
       // Users can read their own purchases
       match /purchases/{purchaseId} {
         allow read, write: if request.auth != null && 
           (request.auth.token.role == 'admin' || 
            resource.data.userId == request.auth.uid);
       }
     }
   }
   ```

2. **Storage Rules**
   Go to Storage > Rules and update with:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /products/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## Step 5: Create Admin User

1. **Register a regular user first**
   - Start the application
   - Register a new account
   - Note the user's UID from Firebase Console > Authentication

2. **Make the user an admin**
   - Go to Firebase Console > Authentication > Users
   - Find your user and copy the UID
   - Use Firebase Admin SDK or manually update the user's role in Firestore

## Step 6: Run the Application

```bash
# Start both frontend and backend (from root directory)
npm run dev

# Or start them separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
cd client && npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Step 7: Test the Application

1. **Register/Login**: Create an account or log in
2. **Browse Products**: View the products page
3. **Add Products**: Create new products (if you're a seller)
4. **Shopping Cart**: Add items to cart and checkout
5. **Admin Features**: Access admin dashboard (if you're an admin)

## Project Structure

```
clothing-ecommerce-app/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── config/        # Configuration files
│   └── package.json
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── index.js         # Server entry point
├── package.json
└── README.md
```

## Features Implemented

### ✅ Completed
- User authentication (register/login/logout)
- Product management (CRUD operations)
- Shopping cart functionality
- Role-based access control
- Firebase integration
- Responsive UI with Tailwind CSS
- API endpoints for all major features

### 🚧 In Development
- Product detail pages
- Checkout process
- Admin dashboard
- Purchase history
- Product image upload
- Advanced filtering and search

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Verify your Firebase configuration
   - Check that all services are enabled
   - Ensure security rules are properly set

2. **CORS Errors**
   - Check that the backend is running on port 5000
   - Verify the frontend proxy configuration

3. **Authentication Issues**
   - Clear browser cache and cookies
   - Check Firebase Authentication settings
   - Verify user roles in Firestore

4. **Image Upload Issues**
   - Check Firebase Storage rules
   - Verify storage bucket configuration
   - Ensure proper file permissions

### Getting Help

- Check the console for error messages
- Verify all environment variables are set correctly
- Ensure Firebase services are properly configured
- Check the network tab for API request failures

## Deployment

### Frontend (Vercel/Netlify)
1. Build the React app: `cd client && npm run build`
2. Deploy the `build` folder to your hosting platform

### Backend (Heroku/Vercel)
1. Set environment variables in your hosting platform
2. Deploy the server directory
3. Update the frontend API URL to point to your deployed backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 