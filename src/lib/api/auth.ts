import { supabase } from '@/lib/supabase';

export async function getAccessToken(errorMessage = 'You must be logged in to continue.') {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error(errorMessage);
  }

  const expiresAt = session.expires_at ? session.expires_at * 1000 : null;
  if (expiresAt !== null && expiresAt <= Date.now()) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !refreshed.session?.access_token) {
      throw new Error(errorMessage);
    }

    return refreshed.session.access_token;
  }

  return session.access_token;
}
