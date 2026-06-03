import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

// Mock User and Session for local-only performance
const MOCK_USER = {
  id: 'guest_user',
  email: 'guest@example.com',
  user_metadata: {
    full_name: 'IELTS Candidate',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as any;

const MOCK_SESSION = {
  access_token: 'mock_token',
  refresh_token: 'mock_token',
  expires_in: 3600,
  token_type: 'bearer',
  user: MOCK_USER,
} as any;

interface AuthContextType {
  session: any | null;
  user: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const { data: { session: storedSession } } = await supabase.auth.getSession();
        
        if (storedSession) {
          setSession(storedSession);
          setUser(storedSession.user);
        } else {
          // Initialize guest user if no session exists
          const guestSession = MOCK_SESSION;
          setSession(guestSession);
          setUser(guestSession.user);
          
          // Seed the mock DB with an empty profile if it doesn't exist
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', guestSession.user.id).maybeSingle();
          if (!profile) {
             await supabase.from('profiles').insert({
               id: guestSession.user.id,
               full_name: '',
               email: '',
               age: null,
               gender: '',
               created_at: new Date().toISOString()
             });
          }
        }
      } catch (err) {
        console.error("Auth init failed:", err);
      } finally {
        setLoading(false);
      }
    }
    
    initAuth();

    const handleAuthChange = () => {
      supabase.auth.getSession().then(({ data: { session: storedSession } }) => {
        if (storedSession) {
          setSession(storedSession);
          setUser(storedSession.user);
        }
      });
    };
    
    window.addEventListener('ielts_auth_updated', handleAuthChange);
    return () => window.removeEventListener('ielts_auth_updated', handleAuthChange);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
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
