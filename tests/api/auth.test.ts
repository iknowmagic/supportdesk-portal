/**
 * Authentication tests verifying user login functionality
 */
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { afterAll, describe, expect, test } from 'vitest';
import { signInEphemeralTestUser } from '../helpers/auth';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY as string;
const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL as string;
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD as string;

if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error('Missing Supabase configuration for auth tests');
}

if (!DEMO_USER_EMAIL || !DEMO_USER_PASSWORD) {
  throw new Error('Missing DEMO_USER credentials in .env');
}

describe('Authentication', () => {
  describe('Ephemeral Test User', () => {
    let cleanup: (() => Promise<void>) | undefined;

    afterAll(async () => {
      if (cleanup) {
        await cleanup();
      }
    });

    test('can create and sign in ephemeral user', async () => {
      const result = await signInEphemeralTestUser();
      cleanup = result.cleanup;

      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.user.email).toMatch(/^test\+ephemeral-\d+-\d+@example\.com$/);
      expect(result.session.access_token).toBeTruthy();
      expect(result.session.user.id).toBe(result.user.id);
    });

    test('ephemeral user can make authenticated requests', async () => {
      const { session, user, cleanup: cleanupFn } = await signInEphemeralTestUser();
      cleanup = cleanupFn;

      const client = createClient(SUPABASE_URL, ANON_KEY);
      await client.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      // Verify the session is valid and user is authenticated
      const {
        data: { user: authUser },
        error,
      } = await client.auth.getUser();

      expect(error).toBeNull();
      expect(authUser).toBeDefined();
      expect(authUser?.id).toBe(user.id);
      expect(authUser?.email).toBe(user.email);
    });
  });

  describe('DEMO User from .env', () => {
    test('can sign in with DEMO_USER credentials', async () => {
      const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data, error } = await client.auth.signInWithPassword({
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.session).toBeDefined();
      expect(data.user?.email).toBe(DEMO_USER_EMAIL);
      expect(data.session?.access_token).toBeTruthy();
    });

    test('DEMO user can make authenticated requests', async () => {
      const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const signIn = await client.auth.signInWithPassword({
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
      });

      expect(signIn.error).toBeNull();
      expect(signIn.data.session).toBeDefined();

      // Verify the session is valid and user is authenticated
      const {
        data: { user },
        error,
      } = await client.auth.getUser();

      expect(error).toBeNull();
      expect(user).toBeDefined();
      expect(user?.id).toBe(signIn.data.user?.id);
      expect(user?.email).toBe(DEMO_USER_EMAIL);
    });
  });
});
