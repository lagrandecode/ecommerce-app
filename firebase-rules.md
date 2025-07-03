# Firebase Security Rules

## Firestore Rules
Go to Firebase Console > Firestore Database > Rules and replace with:

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

## Storage Rules
Go to Firebase Console > Storage > Rules and replace with:

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

## How to Apply Rules:
1. Go to Firebase Console
2. Navigate to the respective service (Firestore or Storage)
3. Click on "Rules" tab
4. Replace the existing rules with the ones above
5. Click "Publish" 