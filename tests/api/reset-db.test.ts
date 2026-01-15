/**
 * Reset DB Edge Function tests
 */
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { describe, expect, test, beforeAll } from 'vitest';
import { getTestAuthHeaders, setupTestUser } from '../helpers/auth';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error('Missing Supabase configuration for reset DB tests');
}

const seedActorId = 'a1111111-1111-1111-1111-111111111111';

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

describe('Reset DB Edge Functions', () => {
  beforeAll(async () => {
    await setupTestUser();
  });

  test('reset_db rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/reset_db`, {
      method: 'POST',
    });

    expect(response.status).toBe(401);
  });

  test('reset_db resets and reseeds data for authenticated users', async () => {
    const { data: tempActor, error: insertError } = await anonClient
      .from('actors')
      .insert({
        name: 'Temporary Actor',
        role: 'Customer',
      })
      .select('id')
      .single();

    expect(insertError).toBeNull();
    expect(tempActor?.id).toBeTruthy();

    try {
      const headers = await getTestAuthHeaders();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/reset_db`, {
        method: 'POST',
        headers,
      });

      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);

      const { data: removedActor, error: removedActorError } = await anonClient
        .from('actors')
        .select('id')
        .eq('id', tempActor?.id ?? '');

      expect(removedActorError).toBeNull();
      expect(removedActor).toHaveLength(0);

      const { data: seedActor, error: seedActorError } = await anonClient
        .from('actors')
        .select('id')
        .eq('id', seedActorId)
        .single();

      expect(seedActorError).toBeNull();
      expect(seedActor?.id).toBe(seedActorId);
    } finally {
      if (tempActor?.id) {
        await anonClient.from('actors').delete().eq('id', tempActor.id);
      }
    }
  });

  test('reset_db_4214476 resets data without authentication', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/reset_db_4214476`, {
      method: 'POST',
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);

    const { data: seedActor, error: seedActorError } = await anonClient
      .from('actors')
      .select('id')
      .eq('id', seedActorId)
      .single();

    expect(seedActorError).toBeNull();
    expect(seedActor?.id).toBe(seedActorId);
  });
});
