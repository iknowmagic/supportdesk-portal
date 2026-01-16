import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from '@tanstack/react-router';

export default function TicketDetailPage() {
  const { ticketId } = useParams({ from: '/tickets/$ticketId' });

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Ticket details</h1>
          <p className="text-muted-foreground text-sm">This view will be wired up in the next ticket detail task.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Ticket ID</CardTitle>
            <CardDescription>Placeholder route for ticket detail</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-sm">{ticketId}</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
