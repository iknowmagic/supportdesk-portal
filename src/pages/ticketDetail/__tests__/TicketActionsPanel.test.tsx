import { TicketActionsPanel, TicketReplyForm } from '../TicketActionsPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { setupTestUser } from '../../../../tests/helpers/auth';
import { getTicketDetail, listTickets } from '@/lib/api/tickets';
import { listActors } from '@/lib/api/actors';

loadEnv({ path: resolve(process.cwd(), '.env') });

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const selectOption = async (testId: string, optionLabel: string, user: ReturnType<typeof userEvent.setup>) => {
  const trigger = screen.getByTestId(testId);
  await user.click(trigger);
  await user.keyboard('{ArrowDown}');
  const option = await screen.findByRole('option', { name: optionLabel });
  await user.click(option);
};

async function loadSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase env vars for ticket action UI tests');
  }

  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

  const { supabase } = await import('../../../lib/supabase');
  return supabase;
}

describe('Ticket detail actions UI', () => {
  beforeAll(async () => {
    await setupTestUser();

    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;

    if (!demoEmail || !demoPassword || !supabaseUrl) {
      throw new Error('Missing demo credentials for ticket action UI tests');
    }

    const seedResponse = await fetch(`${supabaseUrl}/functions/v1/reset_db_4214476`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        demo_email: demoEmail,
        demo_password: demoPassword,
      }),
    });

    if (!seedResponse.ok) {
      throw new Error('Failed to seed demo data for ticket action UI tests');
    }
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

    const { supabase } = await import('../../../lib/supabase');
    await supabase.auth.signOut();
    vi.unstubAllEnvs();
  });

  it('shows a success toast when a reply is sent', async () => {
    const supabase = await loadSupabaseClient();
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for ticket reply tests');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const { tickets: ticketsList } = await listTickets();
    const [ticket] = ticketsList;
    if (!ticket) {
      throw new Error('No ticket found for reply tests');
    }

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const successSpy = vi.spyOn(toast, 'success');
    const user = userEvent.setup();

    render(<TicketReplyForm ticketId={ticket.id} />, { wrapper: createWrapper(queryClient) });

    await user.type(screen.getByTestId('ticket-reply-body'), 'Following up on this issue.');
    await user.click(screen.getByTestId('ticket-reply-submit'));

    await waitFor(() => {
      expect(successSpy).toHaveBeenCalledWith('Reply sent');
    });
  });

  it('shows an error toast when a reply fails', async () => {
    const supabase = await loadSupabaseClient();
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for ticket reply tests');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const errorSpy = vi.spyOn(toast, 'error');
    const user = userEvent.setup();

    render(<TicketReplyForm ticketId="missing" />, { wrapper: createWrapper(queryClient) });

    await user.type(screen.getByTestId('ticket-reply-body'), 'Following up on this issue.');
    await user.click(screen.getByTestId('ticket-reply-submit'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith('Failed to send reply');
    });
  });

  it('shows a success toast when status updates', async () => {
    const supabase = await loadSupabaseClient();
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for ticket status tests');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const { tickets: ticketsList } = await listTickets();
    const [ticket] = ticketsList;
    if (!ticket) {
      throw new Error('No ticket found for status tests');
    }

    const detail = await getTicketDetail(ticket.id);

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const successSpy = vi.spyOn(toast, 'success');
    const user = userEvent.setup();

    render(
      <TicketActionsPanel
        ticketId={ticket.id}
        status={detail.ticket.status}
        assignedToActorId={detail.ticket.assigned_to_actor_id ?? null}
      />,
      { wrapper: createWrapper(queryClient) }
    );

    await selectOption('ticket-status-select', 'Pending', user);
    await user.click(screen.getByTestId('ticket-status-submit'));

    await waitFor(() => {
      expect(successSpy).toHaveBeenCalledWith('Status updated');
    });
  });

  it('shows an error toast when status updates fail', async () => {
    const supabase = await loadSupabaseClient();
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for ticket status tests');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const errorSpy = vi.spyOn(toast, 'error');
    const user = userEvent.setup();

    render(
      <TicketActionsPanel ticketId="missing" status="open" assignedToActorId={null} />,
      { wrapper: createWrapper(queryClient) }
    );

    await selectOption('ticket-status-select', 'Closed', user);
    await user.click(screen.getByTestId('ticket-status-submit'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith('Failed to update status');
    });
  });

  it('shows a success toast when assignee updates', async () => {
    const supabase = await loadSupabaseClient();
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for ticket assignee tests');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const { tickets: ticketsList } = await listTickets();
    const [ticket] = ticketsList;
    const actors = await listActors();
    const agent = actors.agents[0];

    if (!ticket || !agent) {
      throw new Error('No ticket or agent found for assignee tests');
    }

    const detail = await getTicketDetail(ticket.id);

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const successSpy = vi.spyOn(toast, 'success');
    const user = userEvent.setup();

    render(
      <TicketActionsPanel
        ticketId={ticket.id}
        status={detail.ticket.status}
        assignedToActorId={detail.ticket.assigned_to_actor_id ?? null}
      />,
      { wrapper: createWrapper(queryClient) }
    );

    await selectOption('ticket-assignee-select', agent.name, user);
    await user.click(screen.getByTestId('ticket-assignee-submit'));

    await waitFor(() => {
      expect(successSpy).toHaveBeenCalledWith('Assignee updated');
    });
  });

  it('shows an error toast when assignee updates fail', async () => {
    const supabase = await loadSupabaseClient();
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for ticket assignee tests');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const actors = await listActors();
    const agent = actors.agents[0];

    if (!agent) {
      throw new Error('No agent found for assignee tests');
    }

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const errorSpy = vi.spyOn(toast, 'error');
    const user = userEvent.setup();

    render(
      <TicketActionsPanel ticketId="missing" status="open" assignedToActorId={null} />,
      { wrapper: createWrapper(queryClient) }
    );

    await selectOption('ticket-assignee-select', agent.name, user);
    await user.click(screen.getByTestId('ticket-assignee-submit'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith('Failed to update assignee');
    });
  });
});
