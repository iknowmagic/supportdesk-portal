import type { Session, User } from '@supabase/supabase-js';
import { noctare } from './devLogger';
import { createContext, useContext, useEffect, useState } from 'react';
import { getDemoAutoLoginEnabled, setDemoAutoLoginEnabled } from './authStorage';
import { supabase } from './supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadSession = async () => {
      try {
        // Get initial session from Supabase
        const { data } = await supabase.auth.getSession();
        if (!isActive) return;

        const session = data.session;
        const sessionExpiresAt = session?.expires_at ? session.expires_at * 1000 : null;
        const isExpired = sessionExpiresAt !== null && sessionExpiresAt <= Date.now();

        if (session && !isExpired) {
          setSession(session);
          setDemoAutoLoginEnabled(true);
          setLoading(false);
          return;
        }

        if (session && isExpired) {
          const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();

          if (!isActive) return;

          if (refreshError) {
            noctare.log('[Auth] Session refresh failed', refreshError);
          } else if (refreshedData.session) {
            setSession(refreshedData.session);
            setDemoAutoLoginEnabled(true);
            setLoading(false);
            return;
          }
        }

        const shouldAutoLogin = getDemoAutoLoginEnabled();
        const demoEmail = import.meta.env.VITE_DEMO_USER_EMAIL;
        const demoPassword = import.meta.env.VITE_DEMO_USER_PASSWORD;

        if (shouldAutoLogin && demoEmail && demoPassword) {
          const { data: signInData, error } = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword,
          });

          if (!isActive) return;

          if (error) {
            noctare.log('[Auth] Auto-login failed', error);
          } else {
            setSession(signInData.session);
            setDemoAutoLoginEnabled(true);
          }
        }
      } catch (error) {
        noctare.log('[Auth] Session check failed', error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadSession();

    // Listen for auth state changes
    // Best practice: Use onAuthStateChange to handle all session updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle different auth events
      if (event === 'INITIAL_SESSION') {
        // Handle initial session loaded from storage
        setSession(session);
        if (session) {
          setDemoAutoLoginEnabled(true);
        }
      } else if (event === 'SIGNED_IN') {
        noctare.log('[Auth] User signed in', {
          details: session?.user?.email,
        });
        setDemoAutoLoginEnabled(true);
        setSession(session);
      } else if (event === 'SIGNED_OUT') {
        noctare.log('[Auth] User signed out');
        setDemoAutoLoginEnabled(false);
        setSession(null);

        // Supabase's signOut() should handle clearing the current project's token
        // But there's a known bug where it sometimes doesn't clear localStorage
        // So we DON'T manually clear anything here - let Supabase handle it
        // If tokens persist, that indicates a Supabase bug we need to work around differently
      } else if (event === 'TOKEN_REFRESHED') {
        noctare.log('[Auth] Token refreshed');
        setSession(session);
      } else if (event === 'USER_UPDATED') {
        noctare.log('[Auth] User updated');
        setSession(session);
      }

      setLoading(false);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading screen while checking auth status
  // This prevents the router from rendering protected routes before we know if user is authenticated
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
