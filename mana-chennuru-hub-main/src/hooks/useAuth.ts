import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmail, signUpWithEmail, signOut, signInWithGoogle, AppUser } from '@/integrations/firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      await signUpWithEmail(email, password, displayName);
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
    setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      throw error;
    }
  };

  return { 
    user, 
    login, 
    signup,
    loginWithGoogle,
    logout, 
    isAuthenticated: !!user,
    loading 
  };
};
