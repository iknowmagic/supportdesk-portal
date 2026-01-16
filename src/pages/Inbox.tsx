import { AppShell } from '@/components/AppShell';
import { NewTicketModal } from '@/components/ticketCreation/NewTicketModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { listTickets, type TicketSummary } from '@/lib/api/tickets';
import { queryKeys } from '@/lib/queryKeys';
import { useNewTicketModal } from '@/store/ticketCreation/hooks';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { Inbox, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function InboxPage() {
  const navigate = useNavigate();
  const { setOpen: setNewTicketModalOpen } = useNewTicketModal();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const trimmedSearchQuery = searchQuery.trim();
  const { data, isLoading, error } = useQuery<TicketSummary[]>({
    queryKey: queryKeys.ticketsList({ status: statusFilter, query: trimmedSearchQuery }),
    queryFn: () => listTickets({ status: statusFilter, query: trimmedSearchQuery }),
    retry: false,
  });

  useEffect(() => {
    if (!error) return;
    toast.error('Failed to load tickets', {
      description: error instanceof Error ? error.message : 'Please try again',
    });
  }, [error]);

  const tickets = data ?? [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <NewTicketModal />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground dark:text-foreground text-3xl font-bold">Inbox</h2>
            <p className="text-muted-foreground dark:text-muted-foreground">
              {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
            </p>
          </div>
          <Button onClick={() => setNewTicketModalOpen(true)} data-testid="new-ticket-button">
            <Plus className="mr-2 size-4" />
            New Ticket
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground dark:text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))
          ) : tickets.length === 0 ? (
            // Empty state
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Inbox className="text-muted-foreground dark:text-muted-foreground mb-4 size-12" />
                <h3 className="text-foreground dark:text-foreground text-lg font-semibold">No tickets found</h3>
                <p className="text-muted-foreground dark:text-muted-foreground mt-1 text-center">
                  {trimmedSearchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first ticket to get started'}
                </p>
                {trimmedSearchQuery === '' && statusFilter === 'all' && (
                  <Button onClick={() => setNewTicketModalOpen(true)} className="mt-4">
                    <Plus className="mr-2 size-4" />
                    New Ticket
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            // Tickets
            tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="hover:bg-muted/50 dark:hover:bg-muted/20 cursor-pointer transition-colors"
                onClick={() => navigate({ to: `/tickets/${ticket.id}` })}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-foreground dark:text-foreground truncate">
                        {ticket.subject}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        From {ticket.from_name} •{' '}
                        {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground dark:text-muted-foreground line-clamp-2 text-sm">
                    {ticket.body}
                  </p>
                  {ticket.assigned_to_name && (
                    <p className="text-muted-foreground dark:text-muted-foreground mt-2 text-xs">
                      Assigned to {ticket.assigned_to_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
