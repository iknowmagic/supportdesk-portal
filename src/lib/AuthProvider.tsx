import type { Session, User } from '@supabase/supabase-js';
import { noctare } from './devLogger';
import { createContext, useContext, useEffect, useState } from 'react';
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
    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    // Best practice: Use onAuthStateChange to handle all session updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle different auth events
      if (event === 'INITIAL_SESSION') {
        // Handle initial session loaded from storage
        setSession(session);
      } else if (event === 'SIGNED_IN') {
        noctare.log('[Auth] User signed in', {
          details: session?.user?.email,
        });
        setSession(session);
      } else if (event === 'SIGNED_OUT') {
        noctare.log('[Auth] User signed out');
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

    return () => subscription.unsubscribe();
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
