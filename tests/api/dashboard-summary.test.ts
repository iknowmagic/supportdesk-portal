/**
 * Dashboard summary Edge Function auth tests.
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';
import { getTestAuthHeaders, setupTestUser } from '../helpers/auth';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase configuration for dashboard summary tests');
}

describe('dashboard_summary Edge Function', () => {
  beforeAll(async () => {
    await setupTestUser();

    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;

    if (!demoEmail || !demoPassword) {
      throw new Error('Missing demo credentials for dashboard summary tests');
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
      throw new Error('Failed to seed demo data for dashboard summary tests');
    }
  });

  test('rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/dashboard_summary`, {
      method: 'POST',
    });

    expect(response.status).toBe(401);
  });

  test('returns aggregated metrics for authenticated requests', async () => {
    const headers = await getTestAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/dashboard_summary`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.totals).toBeTruthy();
    expect(typeof body.totals.total).toBe('number');
    expect(typeof body.totals.open).toBe('number');
    expect(typeof body.totals.pending).toBe('number');
    expect(typeof body.totals.closed).toBe('number');

    expect(body.avgOpenAge).toBeTruthy();
    expect(typeof body.avgOpenAge.minutes).toBe('number');
    expect(typeof body.avgOpenAge.label).toBe('string');
    expect(body.avgOpenAge.label).toMatch(/min|hr|d/);

    expect(Array.isArray(body.dailyVolume)).toBe(true);
    expect(body.dailyVolume.length).toBeGreaterThan(0);
    const dailySample = body.dailyVolume[0];
    expect(typeof dailySample.date).toBe('string');
    expect(typeof dailySample.label).toBe('string');
    expect(typeof dailySample.count).toBe('number');

    expect(Array.isArray(body.priorityBreakdown)).toBe(true);
    expect(body.priorityBreakdown.length).toBeGreaterThan(0);

    expect(Array.isArray(body.assigneeWorkload)).toBe(true);
    const workloadSample = body.assigneeWorkload[0];
    if (workloadSample) {
      expect(typeof workloadSample.assignee).toBe('string');
      expect(typeof workloadSample.count).toBe('number');
    }
  });
});
