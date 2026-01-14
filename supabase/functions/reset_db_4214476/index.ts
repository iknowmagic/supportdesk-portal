/**
 * Reset DB 4214476 Edge Function
 * No authentication required - for hourly cron job
 * Wipes and repopulates the InboxHQ demo database
 */
import { createClient } from '@supabase/supabase-js';
import { populateDatabase, wipeDatabase } from '../_shared/db-operations.ts';

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Wipe the database
    await wipeDatabase(supabaseAdmin);

    // Populate with fresh seed data
    await populateDatabase(supabaseAdmin);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database reset successfully (cron)',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
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
      },
    );
  }
});
