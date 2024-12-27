import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  displayName: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadDisplayName(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadDisplayName(session.user.id);
      } else {
        setDisplayName(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadDisplayName(userId: string) {
    try {
      const { data } = await supabase
        .from('teacher_profiles')
        .select('display_name')
        .eq('user_id', userId)
        .maybeSingle();
      
      setDisplayName(data?.display_name || null);
    } catch (error) {
      // Ignore errors when profile doesn't exist yet
      console.error('Error loading display name:', error);
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateDisplayName = async (name: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('teacher_profiles')
      .upsert({ 
        user_id: user.id,
        display_name: name,
      })
      .select()
      .single();

    if (error) throw error;
    setDisplayName(name);
  };

  const value = {
    user,
    displayName,
    loading,
    signIn,
    signOut,
    updateDisplayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}