/**
 * Tickets list Edge Function
 * Requires authentication - returns ticket list for the Inbox page.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

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

  let payload: {
    status?: string;
    priority?: string;
    assignee?: string;
    query?: string;
    field?: string;
    offset?: number;
    limit?: number;
  } = {};
  try {
    payload = (await req.json()) as {
      status?: string;
      priority?: string;
      assignee?: string;
      query?: string;
      field?: string;
      offset?: number;
      limit?: number;
    };
  } catch (_) {
    payload = {};
  }

  const status = typeof payload.status === 'string' ? payload.status.trim() : '';
  const priority = typeof payload.priority === 'string' ? payload.priority.trim() : '';
  const assignee = typeof payload.assignee === 'string' ? payload.assignee.trim() : '';
  const query = typeof payload.query === 'string' ? payload.query.trim() : '';
  const field = typeof payload.field === 'string' ? payload.field.trim().toLowerCase() : 'all';
  const offset =
    typeof payload.offset === 'number' && Number.isFinite(payload.offset)
      ? Math.max(0, Math.floor(payload.offset))
      : 0;
  const limit =
    typeof payload.limit === 'number' && Number.isFinite(payload.limit)
      ? Math.min(MAX_LIMIT, Math.max(1, Math.floor(payload.limit)))
      : DEFAULT_LIMIT;
  const allowedStatuses = new Set(['open', 'pending', 'closed', 'all', '']);
  const allowedPriorities = new Set(['low', 'normal', 'high', 'urgent', 'all', '']);
  const allowedFields = new Set(['all', 'title', 'description']);

  if (!allowedStatuses.has(status)) {
    return new Response(JSON.stringify({ error: 'Invalid status filter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!allowedPriorities.has(priority)) {
    return new Response(JSON.stringify({ error: 'Invalid priority filter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!allowedFields.has(field)) {
    return new Response(JSON.stringify({ error: 'Invalid search field' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let ticketsQuery = supabaseClient
    .from('tickets')
    .select('id, subject, body, status, priority, from_name, assigned_to_name, created_at, updated_at', {
      count: 'exact',
    })
    .order('updated_at', { ascending: false });

  if (status && status !== 'all') {
    ticketsQuery = ticketsQuery.eq('status', status);
  }

  if (priority && priority !== 'all') {
    ticketsQuery = ticketsQuery.eq('priority', priority);
  }

  if (assignee) {
    ticketsQuery = ticketsQuery.ilike('assigned_to_name', `%${assignee}%`);
  }

  if (query) {
    if (field === 'title') {
      ticketsQuery = ticketsQuery.ilike('subject', `%${query}%`);
    } else if (field === 'description') {
      ticketsQuery = ticketsQuery.ilike('body', `%${query}%`);
    } else {
      ticketsQuery = ticketsQuery.or(
        `subject.ilike.%${query}%,body.ilike.%${query}%,from_name.ilike.%${query}%,assigned_to_name.ilike.%${query}%`
      );
    }
  }

  ticketsQuery = ticketsQuery.order('id', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await ticketsQuery;

  if (error) {
    const message = error.message?.toLowerCase() ?? '';
    const code = typeof error.code === 'string' ? error.code : '';

    if (code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to load tickets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ tickets: data ?? [], total: count ?? 0 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
