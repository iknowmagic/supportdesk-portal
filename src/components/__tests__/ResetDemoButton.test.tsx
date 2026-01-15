import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestUser } from '../../../tests/helpers/auth';
import { toast } from 'sonner';

loadEnv({ path: resolve(process.cwd(), '.env') });

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ResetDemoButton', () => {
  beforeAll(async () => {
    await setupTestUser();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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

  it(
    'shows a success toast when the reset succeeds',
    async () => {
      const successSpy = vi.spyOn(toast, 'success');
      const user = userEvent.setup();
      const email = process.env.VITE_DEMO_USER_EMAIL;
      const password = process.env.VITE_DEMO_USER_PASSWORD;
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

      if (!email || !password || !supabaseUrl || !anonKey) {
        throw new Error('Missing Supabase env vars for reset demo tests');
      }

      vi.resetModules();
      vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

      const [{ ResetDemoButton }, { supabase }] = await Promise.all([
        import('../ResetDemoButton'),
        import('../../lib/supabase'),
      ]);

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }

      render(<ResetDemoButton />, { wrapper: createWrapper() });

      await user.click(screen.getByTestId('reset-demo-button'));
      await user.click(await screen.findByTestId('reset-demo-confirm'));

      await waitFor(() => {
        expect(successSpy).toHaveBeenCalledWith('Demo data reset');
      });
    },
    20000
  );

  it('shows an error toast when the reset fails', async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase env vars for reset demo tests');
    }

    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

    const [{ ResetDemoButton }, { supabase }] = await Promise.all([
      import('../ResetDemoButton'),
      import('../../lib/supabase'),
    ]);

    await supabase.auth.signOut();
    const errorSpy = vi.spyOn(toast, 'error');
    const user = userEvent.setup();

    render(<ResetDemoButton />, { wrapper: createWrapper() });

    await user.click(screen.getByTestId('reset-demo-button'));
    await user.click(await screen.findByTestId('reset-demo-confirm'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
