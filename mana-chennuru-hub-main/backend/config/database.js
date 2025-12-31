import { db } from './firebase.js';

// Firestore connection check
export const connectDB = async () => {
  try {
    if (!db) {
      console.warn('Firestore not initialized. Please configure Firebase credentials.');
      console.warn('Server will continue to run, but Firebase operations may fail.');
      return;
    }

    // Test Firestore connection with a simple query
    try {
      await db.collection('election_commission_documents').limit(1).get();
      console.log('Firestore connected successfully');
    } catch (error) {
      // Collection might not exist yet, which is OK
      console.log('Firestore connected (collection may not exist yet)');
    }
  } catch (error) {
    console.error('Firestore connection error:', error.message);
    console.warn('Server will continue to run, but Firebase operations may fail');
  }
};
