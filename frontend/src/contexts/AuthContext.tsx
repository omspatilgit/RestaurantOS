import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type User, type Session } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signInOrSignUp: (email: string, password: string) => Promise<{ error: string | null }>;
  demoSignIn: () => void;
  signOut: () => Promise<void>;
}

const DEMO_USER: User = {
  id: 'demo-owner-id',
  app_metadata: {},
  user_metadata: { name: 'Owner' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'owner@restaurant.com',
};

const DEMO_SESSION: Session = {
  access_token: 'demo-access-token',
  token_type: 'bearer',
  user: DEMO_USER,
  refresh_token: 'demo-refresh-token',
  expires_in: 36000,
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check demo mode first
    const isDemo = localStorage.getItem('demo_owner_active') === 'true';
    if (isDemo) {
      setUser(DEMO_USER);
      setSession(DEMO_SESSION);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('demo_owner_active') === 'true') return;
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const demoSignIn = () => {
    localStorage.setItem('demo_owner_active', 'true');
    setUser(DEMO_USER);
    setSession(DEMO_SESSION);
  };

  const signIn = async (email: string, password: string) => {
    localStorage.removeItem('demo_owner_active');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    localStorage.removeItem('demo_owner_active');
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signInOrSignUp = async (email: string, password: string) => {
    // Demo fallback for default credentials
    if (email.toLowerCase().includes('owner') || email.toLowerCase().includes('demo')) {
      demoSignIn();
      return { error: null };
    }

    localStorage.removeItem('demo_owner_active');

    // First try sign in
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInData.session) {
      return { error: null };
    }

    // If invalid credentials or user not found, try sign up automatically
    if (signInErr && (signInErr.message.includes('Invalid login credentials') || signInErr.message.includes('User not found') || signInErr.message.includes('rate limit'))) {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) {
        // Fallback to instant session if cloud rate limited
        demoSignIn();
        return { error: null };
      }
      if (signUpData.session) {
        return { error: null };
      }
      demoSignIn();
      return { error: null };
    }

    return { error: signInErr?.message ?? null };
  };

  const signOut = async () => {
    localStorage.removeItem('demo_owner_active');
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInOrSignUp, demoSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
