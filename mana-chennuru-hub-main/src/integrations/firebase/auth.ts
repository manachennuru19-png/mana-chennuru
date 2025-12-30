// Firebase Authentication helper functions
// Import like this:
// import { signInWithEmail, signUpWithEmail, signOut, onAuthStateChanged } from "@/integrations/firebase/auth";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  UserCredential,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  NextOrObserver,
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from './client';
import { convertFirebaseUser, AppUser } from './types';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  
  return userCredential;
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

/**
 * Listen to authentication state changes
 * Returns a function to unsubscribe
 */
export const onAuthStateChanged = (
  callback: (user: AppUser | null) => void
): (() => void) => {
  const unsubscribe = firebaseOnAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    const appUser = convertFirebaseUser(firebaseUser);
    callback(appUser);
  });
  
  return unsubscribe;
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

/**
 * Get current user
 */
export const getCurrentUser = (): AppUser | null => {
  const user = auth.currentUser;
  return convertFirebaseUser(user);
};

