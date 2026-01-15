import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';

loadEnv({ path: resolve(process.cwd(), '.env') });

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('LayoutHeader', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the reset countdown before the reset button', async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase env vars for LayoutHeader tests');
    }

    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

    const [{ LayoutHeader }, { AuthProvider }] = await Promise.all([
      import('../LayoutHeader'),
      import('../../lib/AuthProvider'),
    ]);

    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });

    render(
      <AuthProvider>
        <LayoutHeader>InboxHQ</LayoutHeader>
      </AuthProvider>,
      { wrapper: createWrapper(queryClient) }
    );

    const countdown = await screen.findByTestId('header-reset-countdown');
    const resetButton = screen.getByTestId('reset-demo-button');

    expect(countdown.textContent).toContain('Reset in');
    expect(countdown.compareDocumentPosition(resetButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
