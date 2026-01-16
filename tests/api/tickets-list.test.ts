/**
 * Tickets list Edge Function auth tests.
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';
import { getTestAuthHeaders, setupTestUser } from '../helpers/auth';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase configuration for tickets list tests');
}

describe('tickets_list Edge Function', () => {
  beforeAll(async () => {
    await setupTestUser();

    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;

    if (!demoEmail || !demoPassword) {
      throw new Error('Missing demo credentials for tickets list tests');
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
      throw new Error('Failed to seed demo data for tickets list tests');
    }
  });

  test('rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'POST',
    });

    expect(response.status).toBe(401);
  });

  test('allows authenticated requests', async () => {
    const headers = await getTestAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.tickets)).toBe(true);
  });

  test('filters by status when provided', async () => {
    const headers = await getTestAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ status: 'open' }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.tickets)).toBe(true);
    expect(body.tickets.length).toBeGreaterThan(0);
    body.tickets.forEach((ticket: { status: string }) => {
      expect(ticket.status).toBe('open');
    });
  });

  test('filters by query when provided', async () => {
    const headers = await getTestAuthHeaders();
    const listResponse = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    expect(listResponse.status).toBe(200);
    const listBody = await listResponse.json();
    const sampleTicket = listBody.tickets?.[0];

    expect(sampleTicket).toBeTruthy();

    const queryValue =
      typeof sampleTicket?.subject === 'string' && sampleTicket.subject.trim() !== ''
        ? sampleTicket.subject.trim().split(' ')[0]
        : '';

    expect(queryValue).toBeTruthy();

    const searchResponse = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: queryValue }),
    });

    expect(searchResponse.status).toBe(200);
    const searchBody = await searchResponse.json();
    expect(Array.isArray(searchBody.tickets)).toBe(true);
    const ids = new Set(searchBody.tickets.map((ticket: { id: string }) => ticket.id));
    expect(ids.has(sampleTicket.id)).toBe(true);
  });
});
