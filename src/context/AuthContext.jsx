import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import {
  getCurrentSessionUser,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  updateUserProfile,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getCurrentSessionUser();
      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        refreshUser();
      });
      return () => subscription.unsubscribe();
    }
    return undefined;
  }, [refreshUser]);

  const signIn = useCallback(async (email, password) => {
    const profile = await signInWithEmail(email, password);
    setUser(profile);
    return profile;
  }, []);

  const signUp = useCallback(async (payload) => {
    const result = await signUpWithEmail(payload);
    if (result.user) setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user?.id) throw new Error('Not signed in.');
      const updated = await updateUserProfile(user.id, updates);
      setUser(updated);
      return updated;
    },
    [user?.id],
  );

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user && user.role === 'admin' && user.is_active !== false),
    isDemoMode: !isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
