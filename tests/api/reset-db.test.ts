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

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

describe('Reset DB Edge Functions', () => {
  let demoSession: { access_token: string; refresh_token: string; user: { id: string } } | null = null;

  beforeAll(async () => {
    const { session, user } = await setupTestUser();
    demoSession = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: { id: user.id },
    };
  });

  test('reset_db rejects unauthenticated requests', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/reset_db`, {
      method: 'POST',
    });

    expect(response.status).toBe(401);
  });

  test('reset_db resets and reseeds data for authenticated users', async () => {
    if (!demoSession) {
      throw new Error('Demo session not initialized');
    }

    await anonClient.auth.setSession({
      access_token: demoSession.access_token,
      refresh_token: demoSession.refresh_token,
    });

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

      const { count: demoProfileCount } = await anonClient
        .from('demo_profile')
        .select('id', { count: 'exact', head: true });

      const { count: actorCount } = await anonClient.from('actors').select('id', { count: 'exact', head: true });
      const { count: ticketCount } = await anonClient.from('tickets').select('id', { count: 'exact', head: true });
      const { count: commentCount } = await anonClient.from('comments').select('id', { count: 'exact', head: true });

      expect(demoProfileCount).toBe(21);
      expect(actorCount).toBe(21);
      expect(ticketCount ?? 0).toBeGreaterThanOrEqual(180);
      expect(ticketCount ?? 0).toBeLessThanOrEqual(350);
      expect(commentCount ?? 0).toBeGreaterThanOrEqual(600);
      expect(commentCount ?? 0).toBeLessThanOrEqual(2000);

      const { data: demoProfiles } = await anonClient
        .from('demo_profile')
        .select('id, user_id')
        .eq('user_id', demoSession.user.id);

      expect(demoProfiles).toHaveLength(1);

      const { data: actors } = await anonClient.from('actors').select('id, name');
      const actorMap = new Map((actors ?? []).map((actor) => [actor.id, actor.name]));

      const { data: tickets } = await anonClient
        .from('tickets')
        .select('from_actor_id, from_name, assigned_to_actor_id, assigned_to_name');

      (tickets ?? []).forEach((ticket) => {
        expect(actorMap.get(ticket.from_actor_id)).toBe(ticket.from_name);
        if (ticket.assigned_to_actor_id) {
          expect(actorMap.get(ticket.assigned_to_actor_id)).toBe(ticket.assigned_to_name);
        } else {
          expect(ticket.assigned_to_name).toBeNull();
        }
      });

      const { data: comments } = await anonClient.from('comments').select('actor_id, actor_name');

      (comments ?? []).forEach((comment) => {
        expect(actorMap.get(comment.actor_id)).toBe(comment.actor_name);
      });
    } finally {
      if (tempActor?.id) {
        await anonClient.from('actors').delete().eq('id', tempActor.id);
      }
    }
  });

  test('reset_db_4214476 resets data without authentication', async () => {
    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;

    if (!demoEmail || !demoPassword) {
      throw new Error('Missing demo credentials for reset_db_4214476 test');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/reset_db_4214476`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        demo_email: demoEmail,
        demo_password: demoPassword,
      }),
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
