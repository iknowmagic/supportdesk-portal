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

export function requireAuth({ context }: AuthGuardOptions) {
  if (context.auth.loading) return;

  if (!context.auth.session) {
    throw redirect({ to: '/login' });
  }
}

export function redirectIfAuthenticated({ context }: AuthGuardOptions) {
  if (context.auth.loading) return;

  if (context.auth.session) {
    throw redirect({ to: '/' });
  }
}
