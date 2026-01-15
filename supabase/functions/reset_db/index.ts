/**
 * Reset DB Edge Function
 * Requires authentication - to be called from UI "Reset Demo" button
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
    // Verify the user is authenticated before allowing a reset.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
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

    const demoEmail = user.email ?? Deno.env.get('VITE_DEMO_USER_EMAIL') ?? DEMO_EMAIL;

    // Wipe the database
    await wipeDatabase(supabaseClient);

    // Populate with fresh seed data
    await populateDatabase(supabaseClient, { demoUserId: user.id, demoEmail });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database reset successfully',
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
