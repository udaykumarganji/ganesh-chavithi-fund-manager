'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: 'Not implemented' }),
  signUp: async () => ({ error: 'Not implemented' }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        loadProfile(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          loadProfile(newSession.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (!mounted) return;
      setProfile(data as Profile | null);
      setLoading(false);
    }

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: 'Invalid email or password. Please try again.' };
    }
    return { error: null };
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      return { error: getSignUpErrorMessage(error.message) };
    }
    if (!data.user) {
      return { error: 'Something went wrong. Please try again.' };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function getSignUpErrorMessage(message: string): string {
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (message.includes('password')) {
    return 'Password does not meet the required security rules.';
  }
  if (message.includes('email')) {
    return 'Please enter a valid email address.';
  }
  return 'Something went wrong. Please try again.';
}

export function useAuth() {
  return useContext(AuthContext);
}
