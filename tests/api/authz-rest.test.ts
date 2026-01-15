/**
 * Auth enforcement tests for REST endpoints.
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';
import { getTestAuthHeaders, setupTestUser } from '../helpers/auth';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error('Missing Supabase configuration for REST auth tests');
}

const TABLES = [
  { name: 'tickets', select: 'id' },
  { name: 'comments', select: 'id' },
  { name: 'actors', select: 'id' },
  { name: 'demo_profile', select: 'id' },
];

describe('REST API auth enforcement', () => {
  beforeAll(async () => {
    await setupTestUser();
  });

  test.each(TABLES)('requires auth for %s', async ({ name, select }) => {
    const url = `${SUPABASE_URL}/rest/v1/${name}?select=${encodeURIComponent(select)}&limit=1`;

    const anonResponse = await fetch(url, {
      headers: {
        apikey: ANON_KEY,
      },
    });

    expect([401, 403]).toContain(anonResponse.status);

    const authHeaders = await getTestAuthHeaders();
    const authResponse = await fetch(url, {
      headers: authHeaders,
    });

    expect(authResponse.status).toBe(200);

    const data = await authResponse.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
