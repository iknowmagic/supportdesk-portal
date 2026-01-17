/**
 * Tickets suggest Edge Function auth tests.
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';
import { getTestAuthHeaders, setupTestUser } from '../helpers/auth';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase configuration for tickets suggest tests');
}

describe('tickets_suggest Edge Function', () => {
  beforeAll(async () => {
    await setupTestUser();

    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;

    if (!demoEmail || !demoPassword) {
      throw new Error('Missing demo credentials for tickets suggest tests');
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
      throw new Error('Failed to seed demo data for tickets suggest tests');
    }
  });

  test('rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/tickets_suggest`, {
      method: 'POST',
    });

    expect(response.status).toBe(401);
  });

  test('returns subject suggestions for matching query', async () => {
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

    const subject = typeof sampleTicket?.subject === 'string' ? sampleTicket.subject.trim() : '';
    const queryValue = subject;

    expect(queryValue).toBeTruthy();

    const suggestResponse = await fetch(`${SUPABASE_URL}/functions/v1/tickets_suggest`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: queryValue }),
    });

    expect(suggestResponse.status).toBe(200);
    const suggestBody = await suggestResponse.json();

    expect(Array.isArray(suggestBody.suggestions)).toBe(true);
    const hasSuggestion = suggestBody.suggestions.some((item: string) => item === subject);
    expect(hasSuggestion).toBe(true);
  });
});
