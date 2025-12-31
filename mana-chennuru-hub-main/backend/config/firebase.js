import admin from 'firebase-admin';

let db;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Option 1: Use environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin SDK initialized with credentials');
    }
    // Option 2: Use default credentials (for Google Cloud environments)
    else {
      console.warn('Firebase credentials not found in environment variables. Using default credentials.');
      admin.initializeApp();
    }

    db = admin.firestore();
    console.log('Firestore database initialized');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Don't throw - allow server to start even if Firebase fails
    // This allows testing the API endpoints without Firebase configured
  }
} else {
  db = admin.firestore();
}

export { db };
export default admin;
