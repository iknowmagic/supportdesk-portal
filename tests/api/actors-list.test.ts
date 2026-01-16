/**
 * Actors list Edge Function auth tests.
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';
import { getTestAuthHeaders, setupTestUser } from '../helpers/auth';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase configuration for actors list tests');
}

describe('actors_list Edge Function', () => {
  beforeAll(async () => {
    await setupTestUser();

    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;

    if (!demoEmail || !demoPassword) {
      throw new Error('Missing demo credentials for actors list tests');
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
      throw new Error('Failed to seed demo data for actors list tests');
    }
  });

  test('rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/actors_list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(401);
  });

  test('returns customers and agents for authenticated requests', async () => {
    const headers = await getTestAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/actors_list`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.customers)).toBe(true);
    expect(Array.isArray(body.agents)).toBe(true);
    expect(body.customers.length).toBeGreaterThan(0);
    expect(body.agents.length).toBeGreaterThan(0);

    body.customers.forEach((actor: { role: string }) => {
      expect(actor.role).toBe('customer');
    });

    body.agents.forEach((actor: { role: string }) => {
      expect(['agent', 'admin']).toContain(actor.role);
    });
  });
});
