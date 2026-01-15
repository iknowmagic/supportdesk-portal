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
  });

  test('rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'GET',
    });

    expect(response.status).toBe(401);
  });

  test('allows authenticated requests', async () => {
    const headers = await getTestAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/tickets_list`, {
      method: 'GET',
      headers,
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.tickets)).toBe(true);
  });
});
