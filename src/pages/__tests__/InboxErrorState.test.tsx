import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

loadEnv({ path: resolve(process.cwd(), '.env') });

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
      select({ location: { pathname: '/inbox' } }),
  };
});

let InboxPage: typeof import('../Inbox').default;
let supabase: typeof import('@/lib/supabase').supabase;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Inbox error state', () => {
  beforeAll(async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase env vars for inbox error state tests');
    }

    vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

    InboxPage = (await import('../Inbox')).default;
    ({ supabase } = await import('@/lib/supabase'));
  });

  beforeEach(async () => {
    await supabase.auth.signOut();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('shows a retryable error state when tickets fail to load', async () => {
    render(<InboxPage />, { wrapper: createWrapper() });

    expect(await screen.findByTestId('inbox-error-state')).toBeTruthy();
    expect(screen.getByTestId('inbox-error-retry')).toBeTruthy();
  });
});
