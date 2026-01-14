/**
 * Shared helpers for integration tests that need an authenticated user.
 */
/// <reference types="node" />
import { type AuthError, createClient, type Session, type User } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL as string;
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD as string;
const DEFAULT_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase configuration for test helpers');
}

if (!DEMO_USER_EMAIL || !DEMO_USER_PASSWORD) {
  throw new Error('DEMO_USER_EMAIL and DEMO_USER_PASSWORD must be defined in the environment for integration tests');
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function signInTestUser() {
  const result = await anonClient.auth.signInWithPassword({
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
  });
  if (result.error) {
    throw result.error;
  }
  if (!result.data.session || !result.data.user) {
    throw new Error('Test user sign-in returned no session');
  }
  return result.data;
}

async function ensureUserExists() {
  let signInData: { user: User; session: Session } | null = null;
  let signInError: AuthError | null = null;

  const attempt = await anonClient.auth.signInWithPassword({
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
  });
  if (!attempt.error && attempt.data.user && attempt.data.session) {
    return attempt.data;
  }
  signInError = attempt.error;

  const shouldCreate = !signInError || /invalid login credentials/i.test(signInError.message);

  if (shouldCreate) {
    const { error: createError } = await adminClient.auth.admin.createUser({
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
      email_confirm: true,
    });
    if (createError && !/already/i.test(createError.message)) {
      throw createError;
    }
  } else if (signInError) {
    throw signInError;
  }

  signInData = await signInTestUser();
  return signInData;
}

export async function setupTestUser() {
  const data = await ensureUserExists();
  return data;
}

export async function getTestAuthHeaders() {
  const { session } = await ensureUserExists();
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${session.access_token}`,
  } as const;
}

/**
 * Creates a short‑lived user for an isolated test suite, signs them in, and
 * returns a cleanup to remove all data + the user record when the suite ends.
 */
export async function signInEphemeralTestUser() {
  const nonce = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const email = `test+ephemeral-${nonce}@example.com`;
  const password = `Passw0rd-${nonce}`;

  const { data: _created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) {
    throw createErr;
  }

  const signIn = await anonClient.auth.signInWithPassword({ email, password });
  if (signIn.error || !signIn.data.session || !signIn.data.user) {
    throw signIn.error ?? new Error('Ephemeral user sign-in failed');
  }

  const userId = signIn.data.user.id;

  const cleanup = async () => {
    // Best-effort cleanup; ignore errors to avoid masking test failures.
    await adminClient.auth.admin.deleteUser(userId);
  };

  return { user: signIn.data.user, session: signIn.data.session, cleanup };
}
