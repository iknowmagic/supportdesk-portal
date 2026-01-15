/**
 * Reset DB 4214476 Edge Function
 * No authentication required - for hourly cron job
 * Wipes and repopulates the InboxHQ demo database
 */
import { createClient } from 'npm:@supabase/supabase-js@2';
import { populateDatabase, wipeDatabase } from '../_shared/db-operations.ts';
import { DEMO_EMAIL } from '../_shared/seed-data.ts';

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let payload: { demo_email?: string; demo_password?: string } = {};

    if (req.headers.get('content-type')?.includes('application/json')) {
      payload = (await req.json().catch(() => ({}))) as { demo_email?: string; demo_password?: string };
    }

    const demoPassword = payload.demo_password ?? Deno.env.get('VITE_DEMO_USER_PASSWORD');
    const demoEmail = payload.demo_email ?? Deno.env.get('VITE_DEMO_USER_EMAIL') ?? DEMO_EMAIL;
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    if (!demoPassword) {
      return new Response(JSON.stringify({ error: 'Demo password not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (signInError || !signInData.user || !signInData.session) {
      return new Response(JSON.stringify({ error: 'Demo user sign-in failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await supabaseClient.auth.setSession({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
    });

    // Wipe the database
    await wipeDatabase(supabaseClient);

    // Populate with fresh seed data
    await populateDatabase(supabaseClient, { demoUserId: signInData.user.id, demoEmail });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database reset successfully (cron)',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
