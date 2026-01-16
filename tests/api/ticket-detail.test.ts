/**
 * Ticket detail Edge Function auth tests.
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';
import { getTestAuthHeaders, setupTestUser } from '../helpers/auth';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase configuration for ticket detail tests');
}

describe('ticket_detail Edge Function', () => {
  beforeAll(async () => {
    await setupTestUser();
  });

  test('rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket_detail`, {
      method: 'POST',
      body: JSON.stringify({ ticketId: 'missing' }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status).toBe(401);
  });

  test('returns ticket detail for authenticated requests', async () => {
    const headers = await getTestAuthHeaders();
    const listResponse = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    expect(listResponse.status).toBe(200);
    const listBody = await listResponse.json();
    const ticketId = listBody.tickets?.[0]?.id;

    if (!ticketId) {
      throw new Error('No seeded tickets found for ticket detail test');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/ticket_detail`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticketId }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ticket?.id).toBe(ticketId);
    expect(body.ticket).toHaveProperty('assigned_to_actor_id');
    expect(Array.isArray(body.comments)).toBe(true);
  });
});
