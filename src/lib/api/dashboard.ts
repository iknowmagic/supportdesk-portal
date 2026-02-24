import { getAccessToken } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase';

export type DashboardTotals = {
  total: number;
  open: number;
  pending: number;
  closed: number;
};

export type DashboardDailyVolume = {
  date: string;
  label: string;
  count: number;
};

export type DashboardPriorityBreakdown = {
  priority: 'low' | 'normal' | 'high' | 'urgent' | string;
  count: number;
};

export type DashboardAssigneeWorkload = {
  assignee: string;
  count: number;
};

export type DashboardSummary = {
  totals: DashboardTotals;
  avgOpenAge: {
    minutes: number;
    label: string;
  };
  dailyVolume: DashboardDailyVolume[];
  priorityBreakdown: DashboardPriorityBreakdown[];
  assigneeWorkload: DashboardAssigneeWorkload[];
};

type DashboardSummaryResponse = DashboardSummary;

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const accessToken = await getAccessToken('You must be logged in to view the dashboard.');

  const { data, error } = await supabase.functions.invoke<DashboardSummaryResponse>('dashboard_summary', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {},
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No dashboard summary returned from server.');
  }

  return data;
}
