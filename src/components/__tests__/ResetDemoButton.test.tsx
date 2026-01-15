import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestUser } from '../../../tests/helpers/auth';
import { supabase } from '../../lib/supabase';
import { ResetDemoButton } from '../ResetDemoButton';
import { toast } from 'sonner';

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

const edgeFunctionsAvailable = await (async () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return false;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/reset_db`, { method: 'GET' });
    return response.status !== 503;
  } catch {
    return false;
  }
})();

const itIfEdgeFunctionsAvailable = edgeFunctionsAvailable ? it : it.skip;

describe('ResetDemoButton', () => {
  beforeAll(async () => {
    await setupTestUser();
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing VITE_DEMO_USER_EMAIL or VITE_DEMO_USER_PASSWORD in test environment');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await supabase.auth.signOut();
  });

  itIfEdgeFunctionsAvailable(
    'shows a success toast when the reset succeeds',
    async () => {
      const successSpy = vi.spyOn(toast, 'success');
      const user = userEvent.setup();

    render(<ResetDemoButton />, { wrapper: createWrapper() });

    await user.click(screen.getByTestId('reset-demo-button'));
    await user.click(await screen.findByTestId('reset-demo-confirm'));

      await waitFor(
        () => {
          expect(successSpy).toHaveBeenCalledWith('Demo data reset');
        },
        { timeout: 15000 }
      );
    },
    20000
  );

  it('shows an error toast when the reset fails', async () => {
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
