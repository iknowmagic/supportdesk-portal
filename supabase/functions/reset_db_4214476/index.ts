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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const authHeader = req.headers.get('Authorization');
    let demoUserId: string | null = null;
    let demoEmail = Deno.env.get('VITE_DEMO_USER_EMAIL') ?? DEMO_EMAIL;
    let accessToken = authHeader?.replace(/^Bearer\s+/i, '') ?? null;

    if (authHeader) {
      const supabaseClient = createClient(supabaseUrl, anonKey, {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const {
        data: { user },
        error: authError,
      } = await supabaseClient.auth.getUser();

      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      demoUserId = user.id;
      demoEmail = user.email ?? demoEmail;
    } else {
      let payload: { demo_email?: string; demo_password?: string } = {};

      if (req.headers.get('content-type')?.includes('application/json')) {
        payload = (await req.json().catch(() => ({}))) as { demo_email?: string; demo_password?: string };
      }

      const demoPassword = payload.demo_password ?? Deno.env.get('VITE_DEMO_USER_PASSWORD');
      demoEmail = payload.demo_email ?? demoEmail;

      if (!demoPassword) {
        return new Response(JSON.stringify({ error: 'Demo password not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const supabaseClient = createClient(supabaseUrl, anonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (signInError || !signInData.user || !signInData.session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      demoUserId = signInData.user.id;
      accessToken = signInData.session.access_token;
    }

    if (!demoUserId || !accessToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Wipe the database
    await wipeDatabase(supabaseClient);

    // Populate with fresh seed data
    await populateDatabase(supabaseClient, { demoUserId, demoEmail });

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
  } catch (_error) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
