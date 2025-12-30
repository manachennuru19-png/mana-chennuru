# Firebase Setup Guide

This project has been configured to use Firebase for authentication, database (Firestore), and storage.

## 📋 Prerequisites

1. A Firebase account (sign up at [firebase.google.com](https://firebase.google.com))
2. A Firebase project created in the Firebase Console

## 🔧 Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** > **Get started**
2. Click on **Sign-in method** tab
3. Enable **Email/Password** authentication
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### 3. Create a Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** (for development) or **Production mode** (for production)
3. Select a location for your database (choose the closest to your users)
4. Click **Enable**

### 4. Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click on the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Mana Chennuru Web")
5. Copy the Firebase configuration object

### 5. Set Up Environment Variables

1. Copy the `env.example` file to `.env` in the root directory:
   ```bash
   cp env.example .env
   ```

2. Open `.env` and fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

   You can find these values in your Firebase Console > Project Settings > General > Your apps > Web app config.

### 6. Install Dependencies

Dependencies are already installed. If needed, run:
```bash
npm install
```

## 📁 Project Structure

The Firebase integration is organized as follows:

```
src/integrations/firebase/
├── config.ts          # Firebase configuration (reads from .env)
├── client.ts          # Firebase app initialization & service exports
├── auth.ts            # Authentication helper functions
├── firestore.ts       # Firestore database helper functions
└── types.ts           # TypeScript type definitions
```

## 🔐 Authentication Usage

### Using the `useAuth` Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, login, logout, signup, isAuthenticated, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : isAuthenticated ? (
        <div>
          <p>Welcome, {user?.displayName || user?.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Direct Authentication Functions

```typescript
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOut,
  resetPassword 
} from '@/integrations/firebase/auth';

// Sign in
await signInWithEmail('user@example.com', 'password');

// Sign up
await signUpWithEmail('user@example.com', 'password', 'Display Name');

// Sign out
await signOut();

// Reset password
await resetPassword('user@example.com');
```

## 🗄️ Firestore Usage

### Basic CRUD Operations

```typescript
import { 
  getCollection, 
  getDocument, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  where,
  orderBy 
} from '@/integrations/firebase/firestore';

// Get all shops
const shops = await getCollection<Shop>('shops');

// Get shops that are open
const openShops = await getCollection<Shop>(
  'shops',
  where('isOpenNow', '==', true),
  orderBy('name')
);

// Get a single document
const shop = await getDocument<Shop>('shops', 'shop-id-123');

// Add a new document
const newShopId = await addDocument<Shop>('shops', {
  name: 'My Shop',
  category: 'Grocery',
  address: '123 Main St',
  contact: '+91 98765 43210',
  isOpenNow: true,
  is24_7: false,
  openingHours: '9:00 AM - 9:00 PM',
});

// Update a document
await updateDocument<Shop>('shops', 'shop-id-123', {
  isOpenNow: false,
});

// Delete a document
await deleteDocument('shops', 'shop-id-123');
```

## 📸 Storage Usage (for images/files)

```typescript
import { storage } from '@/integrations/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload an image
const storageRef = ref(storage, `images/${fileName}`);
await uploadBytes(storageRef, file);
const downloadURL = await getDownloadURL(storageRef);
```

## 🔒 Security Rules

Don't forget to set up Firestore Security Rules! In Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all authenticated users
    match /{collection}/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.ownerId;
    }
  }
}
```

For production, implement more specific rules based on your requirements.

## 🚀 Next Steps

1. Set up Firestore collections for your data:
   - `shops` - Shop directory
   - `news` - News articles
   - `temples` - Temple information
   - etc.

2. Implement proper security rules

3. Set up Firebase Storage rules for file uploads

4. Consider implementing:
   - User profile management
   - Role-based access control
   - Real-time data updates (using Firestore real-time listeners)

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)

