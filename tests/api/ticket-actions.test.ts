/**
 * Ticket detail action Edge Function auth tests.
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';
import { getTestAuthHeaders, setupTestUser } from '../helpers/auth';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase configuration for ticket action tests');
}

describe('ticket_comment_create Edge Function', () => {
  beforeAll(async () => {
    await setupTestUser();

    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;

    if (!demoEmail || !demoPassword) {
      throw new Error('Missing demo credentials for ticket action tests');
    }

    const seedResponse = await fetch(`${SUPABASE_URL}/functions/v1/reset_db_4214476`, {
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
      throw new Error('Failed to seed demo data for ticket action tests');
    }
  });

  test('rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket_comment_create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: 'missing',
        body: 'Test reply',
      }),
    });

    expect(response.status).toBe(401);
  });

  test('creates a comment for authenticated requests', async () => {
    const headers = await getTestAuthHeaders();
    const ticketsResponse = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(ticketsResponse.status).toBe(200);
    const ticketsBody = await ticketsResponse.json();
    const ticket = ticketsBody.tickets?.[0];

    expect(ticket).toBeTruthy();

    const actorsResponse = await fetch(`${SUPABASE_URL}/functions/v1/actors_list`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(actorsResponse.status).toBe(200);
    const actorsBody = await actorsResponse.json();
    const agent = actorsBody.agents?.[0];

    expect(agent).toBeTruthy();

    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket_comment_create`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticket.id,
        actor_id: agent.id,
        body: 'Following up on the issue.',
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.comment?.id).toBeTruthy();
    expect(body.comment?.ticket_id).toBe(ticket.id);
    expect(body.comment?.actor_id).toBe(agent.id);
    expect(body.comment?.actor_name).toBe(agent.name);
    expect(body.comment?.body).toBe('Following up on the issue.');
  });
});

describe('ticket_status_update Edge Function', () => {
  test('rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket_status_update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: 'missing',
        status: 'pending',
      }),
    });

    expect(response.status).toBe(401);
  });

  test('updates the status for authenticated requests', async () => {
    const headers = await getTestAuthHeaders();
    const ticketsResponse = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(ticketsResponse.status).toBe(200);
    const ticketsBody = await ticketsResponse.json();
    const ticket = ticketsBody.tickets?.[0];

    expect(ticket).toBeTruthy();

    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket_status_update`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticket.id,
        status: 'pending',
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ticket?.id).toBe(ticket.id);
    expect(body.ticket?.status).toBe('pending');
    expect(body.ticket?.updated_at).toBeTruthy();
  });
});

describe('ticket_assignee_update Edge Function', () => {
  test('rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket_assignee_update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: 'missing',
        assigned_to_actor_id: 'missing',
      }),
    });

    expect(response.status).toBe(401);
  });

  test('updates the assignee for authenticated requests', async () => {
    const headers = await getTestAuthHeaders();
    const ticketsResponse = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(ticketsResponse.status).toBe(200);
    const ticketsBody = await ticketsResponse.json();
    const ticket = ticketsBody.tickets?.[0];

    expect(ticket).toBeTruthy();

    const actorsResponse = await fetch(`${SUPABASE_URL}/functions/v1/actors_list`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(actorsResponse.status).toBe(200);
    const actorsBody = await actorsResponse.json();
    const agent = actorsBody.agents?.[0];

    expect(agent).toBeTruthy();

    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket_assignee_update`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticket.id,
        assigned_to_actor_id: agent.id,
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ticket?.id).toBe(ticket.id);
    expect(body.ticket?.assigned_to_actor_id).toBe(agent.id);
    expect(body.ticket?.assigned_to_name).toBe(agent.name);
    expect(body.ticket?.updated_at).toBeTruthy();
  });
});
