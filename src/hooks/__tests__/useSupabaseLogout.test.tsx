import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { DEMO_AUTO_LOGIN_KEY } from '@/lib/authStorage';

loadEnv({ path: resolve(process.cwd(), '.env') });

async function loadLogoutDependencies() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase env vars for logout tests');
  }

  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

  const [{ useSupabaseLogout }, { supabase }] = await Promise.all([
    import('../useSupabaseLogout'),
    import('../../lib/supabase'),
  ]);

  return { useSupabaseLogout, supabase };
}

describe('useSupabaseLogout', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    localStorage.removeItem(DEMO_AUTO_LOGIN_KEY);
  });

  afterAll(async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) return;

    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

    const { supabase } = await import('../../lib/supabase');
    await supabase.auth.signOut();
    vi.unstubAllEnvs();
  });

  it('shows a success toast when logging out a signed-in user', async () => {
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for logout tests');
    }

    const { useSupabaseLogout, supabase } = await loadLogoutDependencies();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const successSpy = vi.spyOn(toast, 'success');
    const user = userEvent.setup();

    localStorage.setItem(DEMO_AUTO_LOGIN_KEY, 'true');

    const LogoutButton = () => {
      const { logout, isLoggingOut } = useSupabaseLogout();
      return (
        <button type="button" onClick={logout} disabled={isLoggingOut} data-testid="logout-button">
          Logout
        </button>
      );
    };

    render(<LogoutButton />);

    await user.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(successSpy).toHaveBeenCalledWith('Logged out successfully');
    });

    expect(localStorage.getItem(DEMO_AUTO_LOGIN_KEY)).toBe('false');
  });

  it('shows a success toast even when no session exists', async () => {
    const { useSupabaseLogout, supabase } = await loadLogoutDependencies();

    await supabase.auth.signOut();

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      await supabase.auth.signOut();
    }

    const successSpy = vi.spyOn(toast, 'success');
    const errorSpy = vi.spyOn(toast, 'error');
    const user = userEvent.setup();

    localStorage.setItem(DEMO_AUTO_LOGIN_KEY, 'true');

    const LogoutButton = () => {
      const { logout, isLoggingOut } = useSupabaseLogout();
      return (
        <button type="button" onClick={logout} disabled={isLoggingOut} data-testid="logout-button">
          Logout
        </button>
      );
    };

    render(<LogoutButton />);

    await user.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(successSpy).toHaveBeenCalledWith('Logged out successfully');
    });

    expect(errorSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem(DEMO_AUTO_LOGIN_KEY)).toBe('false');
  });
});
