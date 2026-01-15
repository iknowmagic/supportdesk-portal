import { AppShell } from '@/components/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { counterAtom, darkPrefersAtom } from '@/store/demo/atoms';
import { useAtom } from 'jotai';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [count, setCount] = useAtom(counterAtom);
  const [, setDarkPrefers] = useAtom(darkPrefersAtom);

  const activeTheme = useMemo(() => (theme === 'system' ? systemTheme : theme), [theme, systemTheme]);

  const toggleTheme = () => {
    const next = activeTheme === 'dark' ? 'light' : 'dark';
    setTheme(next || 'light');
    setDarkPrefers(next === 'dark');
    toast.success(`Theme set to ${next}`);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Starter template</p>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Theme: {activeTheme ?? 'system'}</Badge>
            <Button onClick={toggleTheme} variant="outline">
              Toggle Theme
            </Button>
            <Button onClick={() => toast.success('Demo toast fired')}>Show Toast</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Jotai Counter</CardTitle>
              <CardDescription>Minimal atom state</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button size="icon" variant="outline" onClick={() => setCount((c) => c - 1)}>
                -
              </Button>
              <div className="text-2xl font-semibold" aria-live="polite">
                {count}
              </div>
              <Button size="icon" variant="outline" onClick={() => setCount((c) => c + 1)}>
                +
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Showcase buttons</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loading</CardTitle>
              <CardDescription>Useful while fetching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tabbed Content</CardTitle>
            <CardDescription>Tabs from shadcn/ui</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-2 pt-4">
                <p className="text-muted-foreground text-sm">Use this tab to summarize key info.</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Badge variant="secondary">Light/Dark ready</Badge>
                  <Badge variant="outline">Jotai state</Badge>
                  <Badge>shadcn/ui</Badge>
                </div>
              </TabsContent>
              <TabsContent value="details" className="pt-4">
                <p className="text-muted-foreground text-sm">Place richer content or forms here.</p>
              </TabsContent>
              <TabsContent value="activity" className="space-y-2 pt-4">
                <p className="text-muted-foreground text-sm">Recent actions:</p>
                <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                  <li>Theme toggled</li>
                  <li>Toast fired</li>
                  <li>Counter updated</li>
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
