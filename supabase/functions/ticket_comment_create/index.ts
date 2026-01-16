/**
 * Ticket comment creation Edge Function
 * Requires authentication - adds a comment to a ticket.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const isPermissionError = (error: { message?: string | null; code?: string | null }) => {
  const message = error.message?.toLowerCase() ?? '';
  const code = typeof error.code === 'string' ? error.code : '';
  return code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege');
};

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

  let payload: { ticket_id?: string; body?: string; actor_id?: string } = {};
  try {
    payload = (await req.json()) as { ticket_id?: string; body?: string; actor_id?: string };
  } catch (_error) {
    payload = {};
  }

  const ticketId = typeof payload.ticket_id === 'string' ? payload.ticket_id.trim() : '';
  const body = typeof payload.body === 'string' ? payload.body.trim() : '';
  const actorId = typeof payload.actor_id === 'string' ? payload.actor_id.trim() : '';

  if (!ticketId || !body) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
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

  const resolvedActorId = actorId || user.id;

  const { data: ticket, error: ticketError } = await supabaseClient
    .from('tickets')
    .select('id')
    .eq('id', ticketId)
    .maybeSingle();

  if (ticketError) {
    if (isPermissionError(ticketError)) {
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

  const { data: actor, error: actorError } = await supabaseClient
    .from('actors')
    .select('id, name')
    .eq('id', resolvedActorId)
    .maybeSingle();

  if (actorError) {
    if (isPermissionError(actorError)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to load actor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!actor) {
    return new Response(JSON.stringify({ error: 'Invalid actor' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: comment, error: insertError } = await supabaseClient
    .from('comments')
    .insert({
      ticket_id: ticketId,
      actor_id: actor.id,
      actor_name: actor.name,
      body,
    })
    .select('id, ticket_id, actor_id, actor_name, body, created_at')
    .single();

  if (insertError) {
    if (isPermissionError(insertError)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to create comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error: updateError } = await supabaseClient
    .from('tickets')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ticketId);

  if (updateError) {
    if (isPermissionError(updateError)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to update ticket' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ comment }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
