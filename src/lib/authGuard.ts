import { redirect } from '@tanstack/react-router';
import type { Session } from '@supabase/supabase-js';

type AuthContext = {
  session: Session | null;
  loading: boolean;
};

type AuthGuardOptions = {
  context: {
    auth: AuthContext;
  };
};

const isSessionExpired = (session: Session | null) => {
  if (!session?.expires_at) return false;
  return session.expires_at * 1000 <= Date.now();
};

export function requireAuth({ context }: AuthGuardOptions) {
  if (context.auth.loading) return;

  if (!context.auth.session || isSessionExpired(context.auth.session)) {
    throw redirect({ to: '/login' });
  }
}

export function redirectIfAuthenticated({ context }: AuthGuardOptions) {
  if (context.auth.loading) return;

  if (context.auth.session) {
    throw redirect({ to: '/inbox' });
  }
}
