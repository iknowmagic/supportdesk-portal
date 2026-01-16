/**
 * Ticket status update Edge Function
 * Requires authentication - updates ticket status.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const isPermissionError = (error: { message?: string | null; code?: string | null }) => {
  const message = error.message?.toLowerCase() ?? '';
  const code = typeof error.code === 'string' ? error.code : '';
  return code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege');
};

const ALLOWED_STATUSES = new Set(['open', 'pending', 'closed']);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: { ticket_id?: string; status?: string } = {};
  try {
    payload = (await req.json()) as { ticket_id?: string; status?: string };
  } catch (_error) {
    payload = {};
  }

  const ticketId = typeof payload.ticket_id === 'string' ? payload.ticket_id.trim() : '';
  const status = typeof payload.status === 'string' ? payload.status.trim().toLowerCase() : '';

  if (!ticketId || !status) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!ALLOWED_STATUSES.has(status)) {
    return new Response(JSON.stringify({ error: 'Invalid status' }), {
      status: 400,
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

  const { data: ticket, error } = await supabaseClient
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select('id, status, updated_at')
    .maybeSingle();

  if (error) {
    if (isPermissionError(error)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to update ticket status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!ticket) {
    return new Response(JSON.stringify({ error: 'Ticket not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ticket }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
