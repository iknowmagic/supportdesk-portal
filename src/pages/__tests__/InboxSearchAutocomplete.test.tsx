import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestUser } from '../../../tests/helpers/auth';
import { listTickets } from '@/lib/api/tickets';

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

describe('Inbox search autocomplete', () => {
  beforeAll(async () => {
    await setupTestUser();

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;

    if (!supabaseUrl || !anonKey || !demoEmail || !demoPassword) {
      throw new Error('Missing Supabase env vars for inbox search tests');
    }

    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

    InboxPage = (await import('../Inbox')).default;
    ({ supabase } = await import('@/lib/supabase'));

    const seedResponse = await fetch(`${supabaseUrl}/functions/v1/reset_db_4214476`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demo_email: demoEmail,
        demo_password: demoPassword,
      }),
    });

    if (!seedResponse.ok) {
      throw new Error('Failed to seed demo data for inbox search tests');
    }
  });

  beforeEach(async () => {
    mockNavigate.mockReset();

    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for inbox search tests');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  });

  afterAll(async () => {
    await supabase.auth.signOut();
    vi.unstubAllEnvs();
  });

  it('lets users pick a ticket from autocomplete results', async () => {
    const [ticket] = await listTickets();
    if (!ticket) {
      throw new Error('No tickets available for autocomplete tests');
    }

    const query = ticket.subject.slice(0, 6);
    const user = userEvent.setup();

    render(<InboxPage />, { wrapper: createWrapper() });

    const input = screen.getByTestId('ticket-search-input');
    await user.type(input, query);

    const suggestion = await screen.findByTestId(`ticket-search-item-${ticket.id}`);
    await user.click(suggestion);

    expect(mockNavigate).toHaveBeenCalledWith({ to: `/tickets/${ticket.id}` });
  });

  it('keeps the query as a filter when choosing the filter action', async () => {
    const [ticket] = await listTickets();
    if (!ticket) {
      throw new Error('No tickets available for autocomplete tests');
    }

    const query = ticket.subject.slice(0, 6);
    const user = userEvent.setup();

    render(<InboxPage />, { wrapper: createWrapper() });

    const input = screen.getByTestId('ticket-search-input') as HTMLInputElement;
    await user.type(input, query);

    const filterAction = await screen.findByTestId('ticket-search-filter');
    await user.click(filterAction);

    expect(screen.queryByTestId('ticket-search-suggestions')).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
