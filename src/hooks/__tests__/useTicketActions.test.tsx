import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestUser } from '../../../tests/helpers/auth';
import { queryKeys } from '@/lib/queryKeys';

loadEnv({ path: resolve(process.cwd(), '.env') });

async function loadTicketActionDependencies() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase env vars for ticket action hook tests');
  }

  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

  const [
    { supabase },
    { useCreateTicketCommentMutation, useUpdateTicketStatusMutation, useUpdateTicketAssigneeMutation },
    { listTickets },
    { listActors },
  ] = await Promise.all([
    import('../../lib/supabase'),
    import('../useTicketActions'),
    import('../../lib/api/tickets'),
    import('../../lib/api/actors'),
  ]);

  return {
    supabase,
    useCreateTicketCommentMutation,
    useUpdateTicketStatusMutation,
    useUpdateTicketAssigneeMutation,
    listTickets,
    listActors,
  };
}

describe('useTicketActions', () => {
  beforeAll(async () => {
    await setupTestUser();

    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;

    if (!demoEmail || !demoPassword || !supabaseUrl) {
      throw new Error('Missing demo credentials for ticket action hook tests');
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
      throw new Error('Failed to seed demo data for ticket action hook tests');
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

    const { supabase } = await import('../../lib/supabase');
    await supabase.auth.signOut();
    vi.unstubAllEnvs();
  });

  it('invalidates ticket detail after creating a comment', async () => {
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for ticket action hook tests');
    }

    const {
      supabase,
      useCreateTicketCommentMutation,
      listTickets,
      listActors,
    } = await loadTicketActionDependencies();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const { tickets: ticketsList } = await listTickets();
    const [ticket] = ticketsList;
    const actors = await listActors();
    const agent = actors.agents[0];

    if (!ticket || !agent) {
      throw new Error('Missing ticket or agent for comment mutation test');
    }

    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const user = userEvent.setup();

    const CreateCommentButton = () => {
      const mutation = useCreateTicketCommentMutation();
      return (
        <button
          type="button"
          onClick={() =>
            mutation.mutate({
              ticket_id: ticket.id,
              actor_id: agent.id,
              body: 'Following up on the issue.',
            })
          }
          data-testid="comment-button"
        >
          Add comment
        </button>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <CreateCommentButton />
      </QueryClientProvider>
    );

    await user.click(screen.getByTestId('comment-button'));

    await waitFor(() => {
      const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey?.join(':'));
      expect(invalidatedKeys).toContain(queryKeys.ticketDetail(ticket.id).join(':'));
    });
  });

  it('invalidates ticket detail after updating status', async () => {
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for ticket action hook tests');
    }

    const { supabase, useUpdateTicketStatusMutation, listTickets } = await loadTicketActionDependencies();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const { tickets: ticketsList } = await listTickets();
    const [ticket] = ticketsList;

    if (!ticket) {
      throw new Error('Missing ticket for status mutation test');
    }

    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const user = userEvent.setup();

    const UpdateStatusButton = () => {
      const mutation = useUpdateTicketStatusMutation();
      return (
        <button
          type="button"
          onClick={() =>
            mutation.mutate({
              ticket_id: ticket.id,
              status: 'pending',
            })
          }
          data-testid="status-button"
        >
          Update status
        </button>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <UpdateStatusButton />
      </QueryClientProvider>
    );

    await user.click(screen.getByTestId('status-button'));

    await waitFor(() => {
      const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey?.join(':'));
      expect(invalidatedKeys).toContain(queryKeys.ticketDetail(ticket.id).join(':'));
    });
  });

  it('invalidates ticket detail after updating assignee', async () => {
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing demo credentials for ticket action hook tests');
    }

    const {
      supabase,
      useUpdateTicketAssigneeMutation,
      listTickets,
      listActors,
    } = await loadTicketActionDependencies();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const { tickets: ticketsList } = await listTickets();
    const [ticket] = ticketsList;
    const actors = await listActors();
    const agent = actors.agents[0];

    if (!ticket || !agent) {
      throw new Error('Missing ticket or agent for assignee mutation test');
    }

    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const user = userEvent.setup();

    const UpdateAssigneeButton = () => {
      const mutation = useUpdateTicketAssigneeMutation();
      return (
        <button
          type="button"
          onClick={() =>
            mutation.mutate({
              ticket_id: ticket.id,
              assigned_to_actor_id: agent.id,
            })
          }
          data-testid="assignee-button"
        >
          Update assignee
        </button>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <UpdateAssigneeButton />
      </QueryClientProvider>
    );

    await user.click(screen.getByTestId('assignee-button'));

    await waitFor(() => {
      const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey?.join(':'));
      expect(invalidatedKeys).toContain(queryKeys.ticketDetail(ticket.id).join(':'));
    });
  });
});
