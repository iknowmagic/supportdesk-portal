import { AppShell } from '@/components/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardSummary } from '@/lib/api/dashboard';
import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { type ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

const CHART_COLORS = {
  volume: 'var(--chart-1)',
  workload: 'var(--chart-5)',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'var(--chart-2)',
  normal: 'var(--chart-1)',
  high: 'var(--chart-3)',
  urgent: 'var(--chart-4)',
};

const StatusCard = ({ label, value, isLoading }: { label: string; value: string | number; isLoading: boolean }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardDescription>{label}</CardDescription>
      {isLoading ? <Skeleton className="h-7 w-20" /> : <CardTitle>{value}</CardTitle>}
    </CardHeader>
  </Card>
);

const ChartCard = ({
  title,
  description,
  isLoading,
  children,
  testId,
}: {
  title: string;
  description: string;
  isLoading: boolean;
  children: ReactNode;
  testId?: string;
}) => (
  <Card data-testid={testId}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="h-72">{isLoading ? <Skeleton className="h-full w-full" /> : children}</CardContent>
  </Card>
);

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: getDashboardSummary,
    retry: false,
  });

  useEffect(() => {
    if (!error) return;
    toast.error('Failed to load dashboard', {
      description: error instanceof Error ? error.message : 'Please try again.',
    });
  }, [error]);

  const totals = data?.totals;
  const avgOpenAge = data?.avgOpenAge;
  const dailyVolume = data?.dailyVolume ?? [];
  const priorityBreakdown = data?.priorityBreakdown ?? [];
  const assigneeWorkload = data?.assigneeWorkload ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Dashboard overview</p>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <Badge variant="secondary">Last 30 days</Badge>
        </div>

        {error ? (
          <Card data-testid="dashboard-error-state">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="space-y-1">
                <h3 className="text-foreground text-lg font-semibold">Unable to load dashboard</h3>
                <p className="text-muted-foreground text-sm">Please try again in a moment.</p>
              </div>
              <Button variant="secondary" onClick={() => refetch()} data-testid="dashboard-error-retry">
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatusCard label="Total tickets" value={totals?.total ?? 0} isLoading={isLoading} />
              <StatusCard label="Open" value={totals?.open ?? 0} isLoading={isLoading} />
              <StatusCard label="Pending" value={totals?.pending ?? 0} isLoading={isLoading} />
              <StatusCard label="Closed" value={totals?.closed ?? 0} isLoading={isLoading} />
              <StatusCard label="Avg open age" value={avgOpenAge?.label ?? '0min'} isLoading={isLoading} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <ChartCard
                title="Ticket volume"
                description="Daily tickets created over the last 30 days."
                isLoading={isLoading}
                testId="dashboard-volume-chart"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyVolume} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={6} minTickGap={16} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={CHART_COLORS.volume}
                      fill={CHART_COLORS.volume}
                      fillOpacity={0.18}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Priority mix"
                description="How tickets stack by priority."
                isLoading={isLoading}
                testId="dashboard-priority-chart"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityBreakdown} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                      {priorityBreakdown.map((entry) => (
                        <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || CHART_COLORS.volume} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard
              title="Assignee workload"
              description="Open and pending tickets by assignee."
              isLoading={isLoading}
              testId="dashboard-assignee-chart"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assigneeWorkload} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis dataKey="assignee" type="category" tick={{ fontSize: 12 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill={CHART_COLORS.workload} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </div>
    </AppShell>
  );
}
