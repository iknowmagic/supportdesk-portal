/**
 * Ticket suggestions Edge Function
 * Requires authentication - returns subject suggestions for the Inbox search bar.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const MAX_SUGGESTIONS = 5;
const SOURCE_LIMIT = 300;
const MIN_SIMILARITY = 0.3;

type SuggestionScore = {
  subject: string;
  updatedAt: string;
  score: number;
  matchStart: number;
  matchLength: number;
};

const toLower = (value: string) => value.toLowerCase();

const tokenize = (value: string) => value.split(/[^a-z0-9]+/i).filter(Boolean);

const levenshteinDistance = (left: string, right: string) => {
  if (left === right) return 0;
  if (left.length === 0) return right.length;
  if (right.length === 0) return left.length;

  const previous = new Array(right.length + 1).fill(0);
  const current = new Array(right.length + 1).fill(0);

  for (let j = 0; j <= right.length; j += 1) {
    previous[j] = j;
  }

  for (let i = 0; i < left.length; i += 1) {
    current[0] = i + 1;
    for (let j = 0; j < right.length; j += 1) {
      const cost = left[i] === right[j] ? 0 : 1;
      current[j + 1] = Math.min(current[j] + 1, previous[j + 1] + 1, previous[j] + cost);
    }
    for (let j = 0; j <= right.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return current[right.length];
};

const similarityScore = (left: string, right: string) => {
  const maxLength = Math.max(left.length, right.length);
  if (maxLength === 0) return 0;
  const distance = levenshteinDistance(left, right);
  return Math.max(0, 1 - distance / maxLength);
};

const findLongestPrefixMatch = (subject: string, query: string) => {
  const maxLength = Math.min(subject.length, query.length);
  for (let length = maxLength; length >= 1; length -= 1) {
    const prefix = query.slice(0, length);
    const index = subject.indexOf(prefix);
    if (index >= 0) {
      return { matchStart: index, matchLength: length };
    }
  }
  return { matchStart: -1, matchLength: 0 };
};

const scoreSuggestion = (subject: string, updatedAt: string, query: string): SuggestionScore | null => {
  const normalizedSubject = toLower(subject);
  const normalizedQuery = toLower(query);

  if (!normalizedSubject || !normalizedQuery) return null;

  const directIndex = normalizedSubject.indexOf(normalizedQuery);
  if (directIndex >= 0) {
    return {
      subject,
      updatedAt,
      score: 1,
      matchStart: directIndex,
      matchLength: normalizedQuery.length,
    };
  }

  const prefixMatch = findLongestPrefixMatch(normalizedSubject, normalizedQuery);
  const tokens = tokenize(normalizedSubject);
  const tokenScores = tokens.map((token) => similarityScore(normalizedQuery, token));
  const subjectScore = similarityScore(normalizedQuery, normalizedSubject);
  const score = Math.max(subjectScore, ...tokenScores);

  if (score < MIN_SIMILARITY && prefixMatch.matchLength === 0) {
    return null;
  }

  return {
    subject,
    updatedAt,
    score,
    matchStart: prefixMatch.matchStart,
    matchLength: prefixMatch.matchLength,
  };
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
    .order('updated_at', { ascending: false })
    .limit(SOURCE_LIMIT);

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

  const scored = (data ?? [])
    .map((row) => {
      const subject = typeof row?.subject === 'string' ? row.subject.trim() : '';
      const updatedAt = typeof row?.updated_at === 'string' ? row.updated_at : '';
      if (!subject || !updatedAt) return null;
      return scoreSuggestion(subject, updatedAt, normalizedQuery);
    })
    .filter((entry): entry is SuggestionScore => Boolean(entry));

  const seen = new Set<string>();
  const suggestions = scored
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.updatedAt.localeCompare(left.updatedAt);
    })
    .filter((item) => {
      const normalized = item.subject.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .slice(0, MAX_SUGGESTIONS)
    .map(({ subject, matchStart, matchLength }) => ({
      subject,
      matchStart,
      matchLength,
    }));

  return new Response(JSON.stringify({ suggestions }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
