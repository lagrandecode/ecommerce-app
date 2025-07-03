# Firebase Setup Guide for Clothing E-commerce App

## Quick Start Checklist

- [ ] Create Firebase Project
- [ ] Enable Authentication (Email/Password)
- [ ] Enable Firestore Database
- [ ] Enable Storage
- [ ] Download Service Account Key
- [ ] Get Web App Configuration
- [ ] Create Environment Files
- [ ] Set Security Rules
- [ ] Test Connection

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `clothing-ecommerce-app`
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. Click "Save"

### Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **"Start in test mode"**
4. Select location (choose closest to your users)
5. Click "Done"

### Storage
1. Go to **Storage**
2. Click "Get started"
3. Choose **"Start in test mode"**
4. Select same location as Firestore
5. Click "Done"

## Step 3: Get Firebase Configuration

### Backend Configuration (Service Account)
1. Go to **Project Settings** (gear icon)
2. Go to **Service accounts** tab
3. Click "Generate new private key"
4. Download the JSON file
5. Rename to `firebase-service-account.json`
6. Place in `server/` directory

### Frontend Configuration (Web App)
1. In **Project Settings** > **General** tab
2. Scroll to **"Your apps"** section
3. Click web icon (</>)
4. Register app with nickname: "clothing-ecommerce-web"
5. Copy the config object

## Step 4: Create Environment Files

### Backend Environment (.env in root directory)
Create a file called `.env` in the root directory:

```env
# Server Environment Variables
NODE_ENV=development
PORT=5000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@your-project.iam.gserviceaccount.com
```

**Replace the values with:**
- `your-firebase-project-id`: From your Firebase project
- `Your Firebase Private Key Here`: From the service account JSON file
- `your-firebase-client-email@your-project.iam.gserviceaccount.com`: From the service account JSON file

### Frontend Environment (client/.env)
Create a file called `.env` in the `client/` directory:

```env
# Firebase Configuration for React App
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-firebase-app-id

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

**Replace the values with the ones from your Firebase web app config.**

## Step 5: Set Security Rules

### Firestore Rules
1. Go to **Firestore Database** > **Rules**
2. Replace with:

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

### Storage Rules
1. Go to **Storage** > **Rules**
2. Replace with:

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

3. Click "Publish" for both rule sets

## Step 6: Test Your Setup

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Test registration:**
   - Go to http://localhost:3000
   - Click "Register"
   - Create a new account
   - Check Firebase Console > Authentication to see the user

3. **Test login:**
   - Log out and log back in
   - Verify authentication works

## Step 7: Create Admin User

1. **Register a regular user first** (if you haven't already)
2. **Get the user's UID:**
   - Go to Firebase Console > Authentication > Users
   - Find your user and copy the UID
3. **Make the user an admin:**
   - Go to Firestore Database
   - Create a document in `users` collection with the UID as document ID
   - Add field: `role: "admin"`

## Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This is normal if you're hot-reloading
   - The app will work fine

2. **"Permission denied" errors**
   - Check that security rules are published
   - Verify environment variables are correct

3. **"Invalid API key"**
   - Double-check your Firebase web app config
   - Make sure API key is correct in client/.env

4. **"Service account key not found"**
   - Verify firebase-service-account.json is in server/ directory
   - Check that private key is properly formatted in .env

### Verification Commands:

```bash
# Check if backend can connect to Firebase
npm run server

# Check if frontend can connect to Firebase
cd client && npm start
```

## Next Steps

Once Firebase is set up:
1. Test user registration and login
2. Try creating products
3. Test shopping cart functionality
4. Verify image uploads work
5. Test admin features

Your Firebase setup is complete! 🎉 