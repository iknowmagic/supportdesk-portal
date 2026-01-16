/**
 * Ticket detail Edge Function
 * Requires authentication - returns ticket + comments for ticket detail page.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

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

  let ticketId = '';
  try {
    const body = await req.json();
    ticketId = typeof body?.ticketId === 'string' ? body.ticketId : '';
  } catch (_error) {
    ticketId = '';
  }

  if (!ticketId) {
    return new Response(JSON.stringify({ error: 'Missing ticket id' }), {
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

  const { data: ticket, error: ticketError } = await supabaseClient
    .from('tickets')
    .select(
      'id, subject, body, status, priority, from_actor_id, from_name, assigned_to_actor_id, assigned_to_name, created_at, updated_at'
    )
    .eq('id', ticketId)
    .maybeSingle();

  if (ticketError) {
    const message = ticketError.message?.toLowerCase() ?? '';
    const code = typeof ticketError.code === 'string' ? ticketError.code : '';

    if (code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to load ticket' }), {
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

  const { data: comments, error: commentsError } = await supabaseClient
    .from('comments')
    .select('id, actor_name, body, created_at')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (commentsError) {
    const message = commentsError.message?.toLowerCase() ?? '';
    const code = typeof commentsError.code === 'string' ? commentsError.code : '';

    if (code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to load comments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ticket, comments: comments ?? [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
