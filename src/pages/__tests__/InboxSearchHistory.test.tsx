import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('Inbox search history', () => {
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

  it('applies search only on submit and stores history', async () => {
    const allTickets = await listTickets();
    const target = allTickets[0];

    if (!target) {
      throw new Error('No tickets available for search tests');
    }

    const filtered = await listTickets({ query: target.subject });
    const filteredIds = new Set(filtered.map((ticket) => ticket.id));
    const nonMatch = allTickets.find((ticket) => !filteredIds.has(ticket.id));

    if (!nonMatch) {
      throw new Error('Unable to find a non-matching ticket for search tests');
    }

    const user = userEvent.setup();

    render(<InboxPage />, { wrapper: createWrapper() });

    await screen.findByTestId(`ticket-card-${nonMatch.id}`);

    const input = screen.getByTestId('ticket-search-input');
    await user.type(input, target.subject);

    expect(screen.getByTestId(`ticket-card-${nonMatch.id}`)).toBeTruthy();

    await user.click(screen.getByTestId('ticket-search-submit'));

    await waitFor(() => {
      expect(screen.queryByTestId(`ticket-card-${nonMatch.id}`)).toBeNull();
    });

    await user.click(input);

    const historyList = await screen.findByTestId('ticket-search-history');
    const historyItem = within(historyList).getByTestId('ticket-search-history-item-0');
    expect(historyItem.textContent).toContain(target.subject);
  });

  it('allows removing previous searches', async () => {
    const [ticket] = await listTickets();
    if (!ticket) {
      throw new Error('No tickets available for search tests');
    }

    const user = userEvent.setup();

    render(<InboxPage />, { wrapper: createWrapper() });

    const input = screen.getByTestId('ticket-search-input');
    await user.type(input, ticket.subject);
    await user.click(screen.getByTestId('ticket-search-submit'));

    await user.click(input);

    const historyList = await screen.findByTestId('ticket-search-history');
    const historyItem = within(historyList).getByTestId('ticket-search-history-item-0');
    expect(historyItem.textContent).toContain(ticket.subject);

    const removeButton = within(historyList).getByTestId('ticket-search-history-remove-0');
    await user.click(removeButton);

    await waitFor(() => {
      const updatedList = screen.queryByTestId('ticket-search-history');
      if (!updatedList) {
        expect(updatedList).toBeNull();
        return;
      }

      const historyItems = within(updatedList).queryAllByTestId(/ticket-search-history-item-/);
      const hasSubject = historyItems.some((item) => item.textContent?.includes(ticket.subject));
      expect(hasSubject).toBe(false);
    });
  });
});
