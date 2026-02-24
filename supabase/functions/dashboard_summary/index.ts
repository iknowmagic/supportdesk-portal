/**
 * Dashboard summary Edge Function
 * Requires authentication - returns aggregated ticket metrics for the Dashboard.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const DAYS_RANGE = 30;
const MAX_ASSIGNEES = 5;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type TicketRow = {
  status: string | null;
  priority: string | null;
  assigned_to_name: string | null;
  created_at: string | null;
};

const formatDayLabel = (date: Date) => `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;

const formatMinutes = (minutesTotal: number) => {
  const rounded = Math.max(0, Math.round(minutesTotal));
  if (rounded < 60) return `${rounded}min`;
  const days = Math.floor(rounded / (60 * 24));
  const hours = Math.floor((rounded % (60 * 24)) / 60);
  const minutes = rounded % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}hr`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}min`);
  return parts.join(' ');
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
    .from('tickets')
    .select('status, priority, assigned_to_name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    const message = error.message?.toLowerCase() ?? '';
    const code = typeof error.code === 'string' ? error.code : '';

    if (code === '42501' || message.includes('permission denied') || message.includes('insufficient_privilege')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to load dashboard summary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tickets = (data ?? []) as TicketRow[];
  const totals = {
    total: tickets.length,
    open: 0,
    pending: 0,
    closed: 0,
  };
  const priorityCounts: Record<string, number> = {
    low: 0,
    normal: 0,
    high: 0,
    urgent: 0,
  };
  const assigneeCounts = new Map<string, number>();

  const today = new Date();
  const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const startDate = new Date(endDate);
  startDate.setUTCDate(endDate.getUTCDate() - (DAYS_RANGE - 1));

  const dailyCounts = new Map<string, { label: string; count: number }>();
  for (let i = 0; i < DAYS_RANGE; i += 1) {
    const day = new Date(startDate);
    day.setUTCDate(startDate.getUTCDate() + i);
    const key = day.toISOString().slice(0, 10);
    dailyCounts.set(key, { label: formatDayLabel(day), count: 0 });
  }

  let totalOpenMinutes = 0;
  let openCount = 0;
  const nowTime = Date.now();
  const startDateMs = startDate.getTime();

  tickets.forEach((ticket) => {
    const status = ticket.status ?? '';
    const priority = ticket.priority ?? '';
    const createdAt = ticket.created_at ? Date.parse(ticket.created_at) : NaN;

    if (status === 'open') totals.open += 1;
    if (status === 'pending') totals.pending += 1;
    if (status === 'closed') totals.closed += 1;

    if (priority && priorityCounts[priority] !== undefined) {
      priorityCounts[priority] += 1;
    }

    if (status !== 'closed') {
      const assignee = ticket.assigned_to_name?.trim() || 'Unassigned';
      assigneeCounts.set(assignee, (assigneeCounts.get(assignee) ?? 0) + 1);
    }

    if (!Number.isNaN(createdAt)) {
      const createdDateKey = new Date(createdAt).toISOString().slice(0, 10);
      const dayEntry = dailyCounts.get(createdDateKey);
      if (dayEntry) {
        dayEntry.count += 1;
      }

      if (status === 'open' && createdAt >= startDateMs) {
        const ageMinutes = (nowTime - createdAt) / (1000 * 60);
        totalOpenMinutes += Math.max(0, ageMinutes);
        openCount += 1;
      }
    }
  });

  const avgOpenMinutes = openCount > 0 ? totalOpenMinutes / openCount : 0;

  const dailyVolume = Array.from(dailyCounts.entries()).map(([date, entry]) => ({
    date,
    label: entry.label,
    count: entry.count,
  }));

  const priorityBreakdown = Object.entries(priorityCounts).map(([priority, count]) => ({
    priority,
    count,
  }));

  const assigneeWorkload = Array.from(assigneeCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, MAX_ASSIGNEES)
    .map(([assignee, count]) => ({
      assignee,
      count,
    }));

  return new Response(
    JSON.stringify({
      totals,
      avgOpenAge: {
        minutes: Math.round(avgOpenMinutes),
        label: formatMinutes(avgOpenMinutes),
      },
      dailyVolume,
      priorityBreakdown,
      assigneeWorkload,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});
