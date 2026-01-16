/**
 * Actors list Edge Function
 * Requires authentication - returns customers and agents for selectors.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

type ActorRole = 'customer' | 'agent' | 'admin';

type ActorOption = {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: ActorRole;
};

type ActorsListResponse = {
  customers: ActorOption[];
  agents: ActorOption[];
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

  const { data, error } = await supabaseClient
    .from('actors')
    .select('id, name, email, avatar_url, role')
    .order('name', { ascending: true });

  if (error) {
    const message = error.message?.toLowerCase() ?? '';
    const code = typeof error.code === 'string' ? error.code : '';

    if (code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to load actors' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const response: ActorsListResponse = { customers: [], agents: [] };

  (data ?? []).forEach((actor) => {
    const normalizedRole = normalizeRole(actor.role);
    if (!normalizedRole) return;

    const entry: ActorOption = {
      id: actor.id,
      name: actor.name,
      email: actor.email,
      avatar_url: actor.avatar_url,
      role: normalizedRole,
    };

    if (normalizedRole === 'customer') {
      response.customers.push(entry);
    } else {
      response.agents.push(entry);
    }
  });

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
