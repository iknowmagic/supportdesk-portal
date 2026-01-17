import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { config as loadEnv } from 'dotenv';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { resolve } from 'path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestUser } from '../../../tests/helpers/auth';
import { listTickets } from '@/lib/api/tickets';
import { inboxSearchDraftAtom, inboxSearchHistoryAtom, inboxSearchQueryAtom } from '@/store/inbox/atoms';

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
  const store = createStore();
  store.set(inboxSearchDraftAtom, '');
  store.set(inboxSearchQueryAtom, '');
  store.set(inboxSearchHistoryAtom, []);

  return ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </JotaiProvider>
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

    window.localStorage.removeItem('inboxhq:search-history');
  });

  afterAll(async () => {
    await supabase.auth.signOut();
    vi.unstubAllEnvs();
  });

  it('applies search only on submit and stores history for successful searches', async () => {
    const { tickets: allTickets } = await listTickets();
    const target = allTickets[0];

    if (!target) {
      throw new Error('No tickets available for search tests');
    }

    const { tickets: filtered } = await listTickets({ query: target.subject });
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

    await user.clear(input);
    await user.click(input);

    const historyList = await screen.findByTestId('ticket-search-history');
    const historyItem = within(historyList).getByTestId('ticket-search-history-item-0');
    expect(historyItem.textContent).toContain(target.subject);
  });

  it('shows server-backed suggestions when typing', async () => {
    const { tickets: allTickets } = await listTickets();
    const ticket = allTickets[0];
    if (!ticket) {
      throw new Error('No tickets available for suggestion tests');
    }

    const user = userEvent.setup();

    render(<InboxPage />, { wrapper: createWrapper() });

    const input = screen.getByTestId('ticket-search-input');
    await user.type(input, ticket.subject);
    await user.click(screen.getByTestId('ticket-search-submit'));

    await user.clear(input);
    await user.click(input);

    const historyList = await screen.findByTestId('ticket-search-history');
    const historyItem = within(historyList).getByTestId('ticket-search-history-item-0');
    expect(historyItem.textContent).toContain(ticket.subject);

    await user.type(input, ticket.subject);

    await waitFor(() => {
      const historyContainer = screen.queryByTestId('ticket-search-history');
      expect(historyContainer).toBeNull();
    });

    const suggestionsList = await screen.findByTestId('ticket-search-suggestions');
    const suggestionItems = within(suggestionsList).getAllByTestId(/ticket-search-suggestion-/);
    const hasSuggestion = suggestionItems.some((item) => item.textContent?.includes(ticket.subject));
    expect(hasSuggestion).toBe(true);
  });

  it('does not store unsuccessful searches in history', async () => {
    const { tickets: allTickets } = await listTickets();
    let unmatchedQuery = 'zzzz';
    while (allTickets.some((ticket) => ticket.subject.toLowerCase().includes(unmatchedQuery))) {
      unmatchedQuery += 'z';
    }

    const user = userEvent.setup();

    render(<InboxPage />, { wrapper: createWrapper() });

    const input = screen.getByTestId('ticket-search-input');
    await user.type(input, unmatchedQuery);
    await user.click(screen.getByTestId('ticket-search-submit'));

    await waitFor(() => {
      const ticketCards = screen.queryAllByTestId(/ticket-card-/);
      expect(ticketCards.length).toBe(0);
    });

    await user.clear(input);
    await user.click(input);

    const historyList = screen.queryByTestId('ticket-search-history');
    expect(historyList).toBeNull();
  });

  it('allows removing previous searches', async () => {
    const { tickets: ticketsList } = await listTickets();
    const [ticket] = ticketsList;
    if (!ticket) {
      throw new Error('No tickets available for search tests');
    }

    const user = userEvent.setup();

    render(<InboxPage />, { wrapper: createWrapper() });

    const input = screen.getByTestId('ticket-search-input');
    await user.type(input, ticket.subject);
    await user.click(screen.getByTestId('ticket-search-submit'));

    await user.clear(input);
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
