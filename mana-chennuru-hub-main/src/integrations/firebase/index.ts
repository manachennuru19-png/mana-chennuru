// Firebase integration - Main entry point
// Import Firebase services from here:
// import { auth, db, storage } from "@/integrations/firebase";

export { auth, db, storage, default as app } from './client';
export * from './auth';
export * from './firestore';
export * from './types';
export { firebaseConfig } from './config';

