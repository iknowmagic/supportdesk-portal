import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

import { queryKeys } from '@/lib/queryKeys';
import DashboardPage from '../Dashboard';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: '/dashboard' } }),
}));

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => {
      if (!isValidElement(children)) return null;
      return cloneElement(children as ReactElement<{ width?: number; height?: number }>, { width: 640, height: 320 });
    },
  };
});

const buildWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const hasChartColor = (root: HTMLElement, color: string) =>
  root.querySelector(`[fill="${color}"]`) ??
  root.querySelector(`[stroke="${color}"]`) ??
  root.querySelector(`[style*="${color}"]`);

describe('Dashboard charts', () => {
  it('uses the chart palette tokens for dashboard visuals', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } },
    });

    queryClient.setQueryData(queryKeys.dashboardSummary, {
      totals: { total: 183, open: 42, pending: 18, closed: 123 },
      avgOpenAge: { minutes: 420, label: '7hr 0min' },
      dailyVolume: [
        { date: '2026-01-01', label: 'Jan 01', count: 4 },
        { date: '2026-01-02', label: 'Jan 02', count: 9 },
      ],
      priorityBreakdown: [
        { priority: 'low', count: 12 },
        { priority: 'normal', count: 96 },
        { priority: 'high', count: 54 },
        { priority: 'urgent', count: 21 },
      ],
      assigneeWorkload: [
        { assignee: 'Ava Brooks', count: 18 },
        { assignee: 'Julian Park', count: 12 },
      ],
    });

    render(<DashboardPage />, { wrapper: buildWrapper(queryClient) });

    const volumeChart = screen.getByTestId('dashboard-volume-chart');
    expect(hasChartColor(volumeChart, 'var(--chart-1)')).toBeTruthy();

    const priorityChart = screen.getByTestId('dashboard-priority-chart');
    expect(hasChartColor(priorityChart, 'var(--chart-1)')).toBeTruthy();
    expect(hasChartColor(priorityChart, 'var(--chart-2)')).toBeTruthy();
    expect(hasChartColor(priorityChart, 'var(--chart-3)')).toBeTruthy();
    expect(hasChartColor(priorityChart, 'var(--chart-4)')).toBeTruthy();

    const assigneeChart = screen.getByTestId('dashboard-assignee-chart');
    expect(assigneeChart.querySelector('svg')).toBeTruthy();
  });
});
