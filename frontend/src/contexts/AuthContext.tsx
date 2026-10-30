import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { User, Profile } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              fullName: session.user.user_metadata?.full_name || 'Researcher'
            });
            // Fetch profile
            const res = await api.auth.getProfile().catch(() => null);
            if (res?.data) {
              setProfile(res.data);
            }
          }
        } else {
          // Development mock session
          const storedUser = localStorage.getItem('copilot_dev_user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setProfile({
              id: parsed.id,
              full_name: parsed.fullName || 'Lead AI Researcher',
              avatar_url: null,
              preferred_language: 'en'
            });
          } else {
            // Default active dev user
            const devUser: User = {
              id: '00000000-0000-0000-0000-000000000001',
              email: 'dr.karthik@research.ai',
              fullName: 'Dr. Karthik (Lead Architect)'
            };
            setUser(devUser);
            setProfile({
              id: devUser.id,
              full_name: devUser.fullName || 'Lead AI Researcher',
              avatar_url: null,
              preferred_language: 'en'
            });
          }
        }
      } catch (err) {
        console.error('Auth initialization error', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            fullName: session.user.user_metadata?.full_name || 'Researcher'
          });
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      const devUser: User = {
        id: '00000000-0000-0000-0000-000000000001',
        email,
        fullName: email.split('@')[0]
      };
      setUser(devUser);
      localStorage.setItem('copilot_dev_user', JSON.stringify(devUser));
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
    } else {
      const devUser: User = {
        id: crypto.randomUUID(),
        email,
        fullName
      };
      setUser(devUser);
      localStorage.setItem('copilot_dev_user', JSON.stringify(devUser));
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('copilot_dev_user');
      setUser(null);
      setProfile(null);
    }
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

