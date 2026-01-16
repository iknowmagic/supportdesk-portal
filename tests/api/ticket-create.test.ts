/**
 * Ticket creation Edge Function auth tests.
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';
import { getTestAuthHeaders, setupTestUser } from '../helpers/auth';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase configuration for ticket create tests');
}

describe('ticket_create Edge Function', () => {
  beforeAll(async () => {
    await setupTestUser();

    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;

    if (!demoEmail || !demoPassword) {
      throw new Error('Missing demo credentials for ticket create tests');
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
      throw new Error('Failed to seed demo data for ticket create tests');
    }
  });

  test('rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket_create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Demo ticket',
        body: 'Something went wrong.',
        from_actor_id: 'missing',
      }),
    });

    expect(response.status).toBe(401);
  });

  test('creates a ticket with defaults and denormalized names', async () => {
    const headers = await getTestAuthHeaders();
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
    const fromActor = actorsBody.customers?.[0];
    const assignedActor = actorsBody.agents?.[0];

    expect(fromActor).toBeTruthy();
    expect(assignedActor).toBeTruthy();

    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket_create`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: 'Demo ticket',
        body: 'Something went wrong.',
        from_actor_id: fromActor.id,
        assigned_to_actor_id: assignedActor.id,
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ticket?.id).toBeTruthy();
    expect(body.ticket?.status).toBe('open');
    expect(body.ticket?.priority).toBe('normal');
    expect(body.ticket?.from_name).toBe(fromActor.name);
    expect(body.ticket?.assigned_to_name).toBe(assignedActor.name);
    expect(body.ticket?.created_at).toBeTruthy();
    expect(body.ticket?.updated_at).toBeTruthy();
  });
});
