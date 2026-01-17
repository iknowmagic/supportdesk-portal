/**
 * Ticket suggestions Edge Function
 * Requires authentication - returns subject suggestions for the Inbox search bar.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const MAX_SUGGESTIONS = 5;
const QUERY_LIMIT = 20;

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

  let query = '';
  try {
    const body = await req.json();
    query = typeof body?.query === 'string' ? body.query : '';
  } catch (_error) {
    query = '';
  }

  const normalizedQuery = query.trim();

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

  if (!normalizedQuery) {
    return new Response(JSON.stringify({ suggestions: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabaseClient
    .from('tickets')
    .select('subject, updated_at')
    .ilike('subject', `%${normalizedQuery}%`)
    .order('updated_at', { ascending: false })
    .limit(QUERY_LIMIT);

  if (error) {
    const message = error.message?.toLowerCase() ?? '';
    const code = typeof error.code === 'string' ? error.code : '';

    if (code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to load suggestions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const suggestions: string[] = [];
  const seen = new Set<string>();

  (data ?? []).forEach((row) => {
    const subject = typeof row?.subject === 'string' ? row.subject.trim() : '';
    if (!subject) return;

    const normalized = subject.toLowerCase();
    if (seen.has(normalized)) return;

    seen.add(normalized);
    suggestions.push(subject);
  });

  return new Response(JSON.stringify({ suggestions: suggestions.slice(0, MAX_SUGGESTIONS) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
