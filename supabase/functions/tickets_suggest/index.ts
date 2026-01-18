/**
 * Ticket suggestions Edge Function
 * Requires authentication - returns structured suggestions for the Inbox search bar.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const MAX_SUGGESTIONS = 8;
const MAX_PER_KIND = 2;
const SOURCE_LIMIT = 300;
const MIN_SIMILARITY = 0.3;
const DESCRIPTION_SNIPPET_LENGTH = 80;

type SuggestionKind = 'title' | 'description' | 'assignee' | 'status' | 'priority';

type SuggestionScore = {
  kind: SuggestionKind;
  value: string;
  updatedAt: string;
  score: number;
  matchStart: number;
  matchLength: number;
};

const SUGGESTION_ORDER: SuggestionKind[] = ['title', 'description', 'assignee', 'status', 'priority'];

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

const findLongestPrefixMatch = (value: string, query: string) => {
  const maxLength = Math.min(value.length, query.length);
  for (let length = maxLength; length >= 1; length -= 1) {
    const prefix = query.slice(0, length);
    const index = value.indexOf(prefix);
    if (index >= 0) {
      return { matchStart: index, matchLength: length };
    }
  }
  return { matchStart: -1, matchLength: 0 };
};

const scoreSuggestion = (
  value: string,
  updatedAt: string,
  query: string,
  kind: SuggestionKind
): SuggestionScore | null => {
  const normalizedValue = toLower(value);
  const normalizedQuery = toLower(query);

  if (!normalizedValue || !normalizedQuery) return null;

  const directIndex = normalizedValue.indexOf(normalizedQuery);
  if (directIndex >= 0) {
    return {
      kind,
      value,
      updatedAt,
      score: 1,
      matchStart: directIndex,
      matchLength: normalizedQuery.length,
    };
  }

  const prefixMatch = findLongestPrefixMatch(normalizedValue, normalizedQuery);
  const tokens = tokenize(normalizedValue);
  const tokenScores = tokens.map((token) => similarityScore(normalizedQuery, token));
  const valueScore = similarityScore(normalizedQuery, normalizedValue);
  const score = Math.max(valueScore, ...tokenScores);

  if (score < MIN_SIMILARITY && prefixMatch.matchLength === 0) {
    return null;
  }

  return {
    kind,
    value,
    updatedAt,
    score,
    matchStart: prefixMatch.matchStart,
    matchLength: prefixMatch.matchLength,
  };
};

const buildDescriptionSnippet = (value: string, matchStart: number, matchLength: number) => {
  const trimmed = value.trim();
  if (trimmed.length <= DESCRIPTION_SNIPPET_LENGTH) {
    return { value: trimmed, matchStart, matchLength };
  }

  const halfWindow = Math.max(0, Math.floor((DESCRIPTION_SNIPPET_LENGTH - matchLength) / 2));
  const start = matchStart >= 0 ? Math.max(0, matchStart - halfWindow) : 0;
  const safeStart = Math.min(start, Math.max(0, trimmed.length - DESCRIPTION_SNIPPET_LENGTH));
  const snippet = trimmed.slice(safeStart, safeStart + DESCRIPTION_SNIPPET_LENGTH);
  const adjustedMatchStart = matchStart >= 0 ? matchStart - safeStart : -1;

  return {
    value: snippet,
    matchStart: adjustedMatchStart,
    matchLength,
  };
};

const sortAndDedupe = (items: SuggestionScore[]) => {
  const sorted = [...items].sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return right.updatedAt.localeCompare(left.updatedAt);
  });

  const seen = new Set<string>();
  return sorted.filter((item) => {
    const normalized = item.value.toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
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
    .select('subject, body, assigned_to_name, updated_at')
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

  const scored: SuggestionScore[] = [];

  const pushSuggestion = (kind: SuggestionKind, value: string, updatedAt: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const scoredValue = scoreSuggestion(trimmed, updatedAt, normalizedQuery, kind);
    if (!scoredValue) return;

    if (kind === 'description') {
      const snippet = buildDescriptionSnippet(scoredValue.value, scoredValue.matchStart, scoredValue.matchLength);
      scored.push({
        ...scoredValue,
        value: snippet.value,
        matchStart: snippet.matchStart,
        matchLength: snippet.matchLength,
      });
      return;
    }

    scored.push(scoredValue);
  };

  (data ?? []).forEach((row) => {
    const updatedAt = typeof row?.updated_at === 'string' ? row.updated_at : '';
    const subject = typeof row?.subject === 'string' ? row.subject : '';
    const body = typeof row?.body === 'string' ? row.body : '';
    const assignee = typeof row?.assigned_to_name === 'string' ? row.assigned_to_name : '';

    if (updatedAt && subject) {
      pushSuggestion('title', subject, updatedAt);
    }

    if (updatedAt && body) {
      pushSuggestion('description', body, updatedAt);
    }

    if (updatedAt && assignee) {
      pushSuggestion('assignee', assignee, updatedAt);
    }
  });

  const nowIso = new Date().toISOString();
  ['Open', 'Pending', 'Closed'].forEach((value) => pushSuggestion('status', value, nowIso));
  ['Low', 'Normal', 'High', 'Urgent'].forEach((value) => pushSuggestion('priority', value, nowIso));

  const grouped = new Map<SuggestionKind, SuggestionScore[]>();
  scored.forEach((item) => {
    const group = grouped.get(item.kind) ?? [];
    group.push(item);
    grouped.set(item.kind, group);
  });

  const suggestions: Array<Pick<SuggestionScore, 'kind' | 'value' | 'matchStart' | 'matchLength'>> = [];

  for (const kind of SUGGESTION_ORDER) {
    const items = grouped.get(kind) ?? [];
    const sorted = sortAndDedupe(items).slice(0, MAX_PER_KIND);

    for (const item of sorted) {
      suggestions.push({
        kind: item.kind,
        value: item.value,
        matchStart: item.matchStart,
        matchLength: item.matchLength,
      });

      if (suggestions.length >= MAX_SUGGESTIONS) {
        break;
      }
    }

    if (suggestions.length >= MAX_SUGGESTIONS) {
      break;
    }
  }

  return new Response(JSON.stringify({ suggestions }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
