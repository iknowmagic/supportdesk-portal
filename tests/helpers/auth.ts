/**
 * Shared helpers for integration tests that need an authenticated user.
 */
/// <reference types="node" />
import {
  type AuthError,
  createClient,
  type Session,
  type User,
} from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

loadEnv({ path: resolve(process.cwd(), ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL as string;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD as string;
const DEFAULT_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase configuration for test helpers");
}

if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
  throw new Error(
    "TEST_USER_EMAIL and TEST_USER_PASSWORD must be defined in the environment for integration tests",
  );
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function signInTestUser() {
  const result = await anonClient.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });
  if (result.error) {
    throw result.error;
  }
  if (!result.data.session || !result.data.user) {
    throw new Error("Test user sign-in returned no session");
  }
  return result.data;
}

async function ensureUserExists() {
  let signInData: { user: User; session: Session } | null = null;
  let signInError: AuthError | null = null;

  const attempt = await anonClient.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });
  if (!attempt.error && attempt.data.user && attempt.data.session) {
    return attempt.data;
  }
  signInError = attempt.error;

  const shouldCreate = !signInError ||
    /invalid login credentials/i.test(signInError.message);

  if (shouldCreate) {
    const { error: createError } = await adminClient.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
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

  // Ensure the test user has a scheduling window
  const { data: existingWindow, error: windowSelectError } = await adminClient
    .from("scheduling_windows")
    .select("id")
    .eq("user_id", data.user.id)
    .limit(1)
    .single();

  let windowId: string;

  if (windowSelectError || !existingWindow) {
    // Create a default scheduling window
    // NOTE: adminClient (service role) bypasses RLS and DEFAULT auth.uid()
    // so we MUST explicitly provide user_id here
    const { data: newWindow, error: windowInsertError } = await adminClient
      .from("scheduling_windows")
      .insert({
        user_id: data.user.id,
        name: "Work Hours",
        start_time: "08:00:00",
        end_time: "20:00:00",
      })
      .select("id")
      .single();

    if (windowInsertError || !newWindow) {
      throw new Error(
        `Failed to create scheduling_window: ${windowInsertError?.message}`,
      );
    }
    windowId = newWindow.id;
  } else {
    windowId = existingWindow.id;
  }

  // Ensure the test user has a preferences row so client-side requests return
  // a non-empty result. Use the service-role (adminClient) to upsert the row.
  const { error: prefsError } = await adminClient
    .from("user_preferences")
    .upsert(
      {
        user_id: data.user.id,
        work_hours_start: "08:00",
        work_hours_end: "20:00",
        event_color: "rgb(96, 165, 250)",
        auto_schedule: true,
        duration: 60,
        time_zone: DEFAULT_TIME_ZONE,
        window_id: windowId,
        buffer_before: 15,
        buffer_after: 15,
      },
      { onConflict: "user_id" },
    );

  if (prefsError) {
    throw new Error(`Failed to upsert user_preferences: ${prefsError.message}`);
  }

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

  const { data: _created, error: createErr } = await adminClient.auth.admin
    .createUser({
      email,
      password,
      email_confirm: true,
    });
  if (createErr) {
    throw createErr;
  }

  const signIn = await anonClient.auth.signInWithPassword({ email, password });
  if (signIn.error || !signIn.data.session || !signIn.data.user) {
    throw signIn.error ?? new Error("Ephemeral user sign-in failed");
  }

  const userId = signIn.data.user.id;

  // Create a default scheduling window for the ephemeral user
  const { data: newWindow, error: windowError } = await adminClient
    .from("scheduling_windows")
    .insert({
      user_id: userId,
      name: "Work Hours",
      start_time: "08:00:00",
      end_time: "20:00:00",
    })
    .select("id")
    .single();

  if (windowError || !newWindow) {
    throw new Error(
      `Failed to create scheduling_window for ephemeral user: ${windowError?.message}`,
    );
  }

  // Seed minimal preferences so downstream calls don't fail.
  await adminClient.from("user_preferences").upsert({
    user_id: userId,
    work_hours_start: "08:00",
    work_hours_end: "20:00",
    event_color: "rgb(96, 165, 250)",
    auto_schedule: true,
    duration: 60,
    time_zone: DEFAULT_TIME_ZONE,
    window_id: newWindow.id,
    buffer_before: 15,
    buffer_after: 15,
  });

  const cleanup = async () => {
    // Best-effort data cleanup; ignore errors to avoid masking test failures.
    const tables = [
      "dependency_stack_items",
      "dependency_stacks",
      "events",
      "user_duration_presets",
      "user_preferences",
      "scheduling_windows",
    ];
    for (const table of tables) {
      await adminClient.from(table).delete().eq("user_id", userId);
    }
    await adminClient.auth.admin.deleteUser(userId);
  };

  return { user: signIn.data.user, session: signIn.data.session, cleanup };
}
