/**
 * Ticket assignee update Edge Function
 * Requires authentication - updates ticket assignee.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

type ActorRole = 'customer' | 'agent' | 'admin';

const isPermissionError = (error: { message?: string | null; code?: string | null }) => {
  const message = error.message?.toLowerCase() ?? '';
  const code = typeof error.code === 'string' ? error.code : '';
  return code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege');
};

const normalizeRole = (role: string | null): ActorRole | null => {
  const value = (role ?? '').toLowerCase();
  if (value.includes('customer')) return 'customer';
  if (value.includes('admin')) return 'admin';
  if (value.includes('agent')) return 'agent';
  return null;
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

  let payload: { ticket_id?: string; assigned_to_actor_id?: string | null } = {};
  try {
    payload = (await req.json()) as { ticket_id?: string; assigned_to_actor_id?: string | null };
  } catch (_error) {
    payload = {};
  }

  const ticketId = typeof payload.ticket_id === 'string' ? payload.ticket_id.trim() : '';
  const assignedActorId =
    typeof payload.assigned_to_actor_id === 'string' ? payload.assigned_to_actor_id.trim() : null;

  if (!ticketId) {
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

  let updatePayload: { assigned_to_actor_id: string | null; assigned_to_name: string | null; updated_at: string };

  if (assignedActorId) {
    const { data: actor, error: actorError } = await supabaseClient
      .from('actors')
      .select('id, name, role')
      .eq('id', assignedActorId)
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

    const role = normalizeRole(actor.role);
    if (!role || role === 'customer') {
      return new Response(JSON.stringify({ error: 'Invalid assignee' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    updatePayload = {
      assigned_to_actor_id: actor.id,
      assigned_to_name: actor.name,
      updated_at: new Date().toISOString(),
    };
  } else {
    updatePayload = {
      assigned_to_actor_id: null,
      assigned_to_name: null,
      updated_at: new Date().toISOString(),
    };
  }

  const { data: ticket, error } = await supabaseClient
    .from('tickets')
    .update(updatePayload)
    .eq('id', ticketId)
    .select('id, assigned_to_actor_id, assigned_to_name, updated_at')
    .maybeSingle();

  if (error) {
    if (isPermissionError(error)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to update assignee' }), {
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
