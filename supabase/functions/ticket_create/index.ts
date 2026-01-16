/**
 * Ticket create Edge Function
 * Requires authentication - creates a new ticket with validated inputs.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

type TicketStatus = 'open' | 'pending' | 'closed';
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

type TicketCreatePayload = {
  subject?: string;
  body?: string;
  status?: string;
  priority?: string;
  from_actor_id?: string;
  assigned_to_actor_id?: string | null;
};

type ActorRecord = {
  id: string;
  name: string;
  role: string | null;
};

const allowedStatuses = new Set<TicketStatus>(['open', 'pending', 'closed']);
const allowedPriorities = new Set<TicketPriority>(['low', 'normal', 'high', 'urgent']);

const normalizeRole = (role: string | null) => {
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

  let payload: TicketCreatePayload;
  try {
    payload = (await req.json()) as TicketCreatePayload;
  } catch (_) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
  const body = typeof payload.body === 'string' ? payload.body.trim() : '';
  const fromActorId = typeof payload.from_actor_id === 'string' ? payload.from_actor_id.trim() : '';
  const assignedActorId =
    payload.assigned_to_actor_id === null
      ? null
      : typeof payload.assigned_to_actor_id === 'string'
        ? payload.assigned_to_actor_id.trim()
        : null;

  if (!subject || !body || !fromActorId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const statusInput = typeof payload.status === 'string' ? payload.status.trim() : '';
  const priorityInput = typeof payload.priority === 'string' ? payload.priority.trim() : '';
  const status = statusInput ? statusInput.toLowerCase() : 'open';
  const priority = priorityInput ? priorityInput.toLowerCase() : 'normal';

  if (!allowedStatuses.has(status as TicketStatus)) {
    return new Response(JSON.stringify({ error: 'Invalid status' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!allowedPriorities.has(priority as TicketPriority)) {
    return new Response(JSON.stringify({ error: 'Invalid priority' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const actorIds = [fromActorId, assignedActorId].filter(Boolean) as string[];
  const uniqueActorIds = Array.from(new Set(actorIds));

  const { data: actorRows, error: actorError } = await supabaseClient
    .from('actors')
    .select('id, name, role')
    .in('id', uniqueActorIds);

  if (actorError) {
    const message = actorError.message?.toLowerCase() ?? '';
    const code = typeof actorError.code === 'string' ? actorError.code : '';

    if (code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to validate actors' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const actorMap = new Map<string, ActorRecord>((actorRows ?? []).map((actor) => [actor.id, actor]));
  const fromActor = actorMap.get(fromActorId);

  if (!fromActor || normalizeRole(fromActor.role) !== 'customer') {
    return new Response(JSON.stringify({ error: 'Invalid actor selection' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let assignedActor: ActorRecord | null = null;
  if (assignedActorId) {
    assignedActor = actorMap.get(assignedActorId) ?? null;
    const role = assignedActor ? normalizeRole(assignedActor.role) : null;
    if (!assignedActor || (role !== 'agent' && role !== 'admin')) {
      return new Response(JSON.stringify({ error: 'Invalid assignee selection' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const { data: createdTicket, error: insertError } = await supabaseClient
    .from('tickets')
    .insert({
      subject,
      body,
      status: status as TicketStatus,
      priority: priority as TicketPriority,
      from_actor_id: fromActorId,
      from_name: fromActor.name,
      assigned_to_actor_id: assignedActorId,
      assigned_to_name: assignedActor ? assignedActor.name : null,
    })
    .select('id, subject, body, status, priority, from_name, assigned_to_name, created_at, updated_at')
    .single();

  if (insertError) {
    const message = insertError.message?.toLowerCase() ?? '';
    const code = typeof insertError.code === 'string' ? insertError.code : '';

    if (code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to create ticket' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ticket: createdTicket }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
