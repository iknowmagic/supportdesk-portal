import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_AUTO_LOGIN_KEY } from '../authStorage';

const signInWithPassword = vi.fn();
const getSession = vi.fn();
const onAuthStateChange = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession,
      signInWithPassword,
      onAuthStateChange,
    },
  },
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    getSession.mockResolvedValue({ data: { session: null } });
    signInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'demo', email: 'demo@example.com' } } },
      error: null,
    });
    onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('auto signs in when auto-login is enabled and no session exists', async () => {
    localStorage.setItem(DEMO_AUTO_LOGIN_KEY, 'true');
    vi.stubEnv('VITE_DEMO_USER_EMAIL', 'demo@example.com');
    vi.stubEnv('VITE_DEMO_USER_PASSWORD', 'password');

    const { AuthProvider } = await import('../AuthProvider');

    render(
      <AuthProvider>
        <div />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: 'demo@example.com',
        password: 'password',
      });
    });
  });

  it('auto signs in when the stored session is expired', async () => {
    localStorage.setItem(DEMO_AUTO_LOGIN_KEY, 'true');
    vi.stubEnv('VITE_DEMO_USER_EMAIL', 'demo@example.com');
    vi.stubEnv('VITE_DEMO_USER_PASSWORD', 'password');
    getSession.mockResolvedValue({ data: { session: { expires_at: 1 } } });

    const { AuthProvider } = await import('../AuthProvider');

    render(
      <AuthProvider>
        <div />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: 'demo@example.com',
        password: 'password',
      });
    });
  });

  it('skips auto-login when preference is disabled', async () => {
    localStorage.setItem(DEMO_AUTO_LOGIN_KEY, 'false');
    vi.stubEnv('VITE_DEMO_USER_EMAIL', 'demo@example.com');
    vi.stubEnv('VITE_DEMO_USER_PASSWORD', 'password');

    const { AuthProvider } = await import('../AuthProvider');

    render(
      <AuthProvider>
        <div />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getSession).toHaveBeenCalled();
    });

    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});
