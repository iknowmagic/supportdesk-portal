import { AppShell } from '@/components/AppShell';
import { InboxSearch } from '@/components/inbox/InboxSearch';
import { NewTicketModal } from '@/components/ticketCreation/NewTicketModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { listTickets, type TicketsListResult } from '@/lib/api/tickets';
import { queryKeys } from '@/lib/queryKeys';
import { useInboxSearch } from '@/store/inbox/hooks';
import { useNewTicketModal } from '@/store/ticketCreation/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { Inbox, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DEFAULT_TICKETS_PAGE_SIZE } from '@/constants/pagination';

const TicketSkeletonCard = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
);

export default function InboxPage() {
  const navigate = useNavigate();
  const { setOpen: setNewTicketModalOpen } = useNewTicketModal();
  const { query: searchQuery, addHistory } = useInboxSearch();
  const [statusFilter, setStatusFilter] = useState('all');
  const lastHistoryEntry = useRef('');
  const isFetchingNextPageRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const trimmedSearchQuery = searchQuery.trim();
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery<TicketsListResult>({
    queryKey: queryKeys.ticketsList({ status: statusFilter, query: trimmedSearchQuery, limit: DEFAULT_TICKETS_PAGE_SIZE }),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listTickets({
        status: statusFilter,
        query: trimmedSearchQuery,
        limit: DEFAULT_TICKETS_PAGE_SIZE,
        offset: typeof pageParam === 'number' ? pageParam : 0,
      }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.tickets.length < DEFAULT_TICKETS_PAGE_SIZE
        ? undefined
        : (lastPageParam as number) + DEFAULT_TICKETS_PAGE_SIZE,
    retry: false,
  });

  useEffect(() => {
    if (!error) return;
    toast.error('Failed to load tickets', {
      description: error instanceof Error ? error.message : 'Please try again',
    });
  }, [error]);

  useEffect(() => {
    if (!trimmedSearchQuery || !data || data.pages.length === 0) return;
    const firstPage = data.pages[0]?.tickets ?? [];
    if (firstPage.length === 0) return;
    if (lastHistoryEntry.current === trimmedSearchQuery) return;

    addHistory(trimmedSearchQuery);
    lastHistoryEntry.current = trimmedSearchQuery;
  }, [addHistory, data, trimmedSearchQuery]);

  useEffect(() => {
    isFetchingNextPageRef.current = isFetchingNextPage;
  }, [isFetchingNextPage]);

  useEffect(() => {
    if (!hasNextPage) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (isFetchingNextPageRef.current) return;
        fetchNextPage();
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  useEffect(() => {
    if (!isFetchNextPageError) return;
    toast.error('Failed to load more tickets', {
      description: 'Please try again.',
    });
  }, [isFetchNextPageError]);

  const tickets = data?.pages.flatMap((page) => page.tickets) ?? [];
  const totalTickets = data?.pages[0]?.total ?? 0;

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
              Showing {tickets.length} out of {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'}
            </p>
          </div>
          <Button onClick={() => setNewTicketModalOpen(true)} data-testid="new-ticket-button">
            <Plus className="size-4" />
            New Ticket
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <InboxSearch />
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
            Array.from({ length: 5 }).map((_, index) => <TicketSkeletonCard key={`loading-${index}`} />)
          ) : error ? (
            <Card data-testid="inbox-error-state">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <Inbox className="text-muted-foreground dark:text-muted-foreground size-10" />
                <div className="space-y-1">
                  <h3 className="text-foreground dark:text-foreground text-lg font-semibold">Unable to load tickets</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm">
                    Please try again in a moment.
                  </p>
                </div>
                <Button variant="secondary" onClick={() => refetch()} data-testid="inbox-error-retry">
                  Try again
                </Button>
              </CardContent>
            </Card>
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
                    <Plus className="size-4" />
                    New Ticket
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  data-testid={`ticket-card-${ticket.id}`}
                  className="hover:bg-muted/50 dark:hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => navigate({ to: `/tickets/${ticket.id}` })}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-foreground dark:text-foreground truncate">{ticket.subject}</CardTitle>
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
                    <p className="text-muted-foreground dark:text-muted-foreground line-clamp-2 text-sm">{ticket.body}</p>
                    {ticket.assigned_to_name && (
                      <p className="text-muted-foreground dark:text-muted-foreground mt-2 text-xs">
                        Assigned to {ticket.assigned_to_name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {isFetchingNextPage && (
                <div className="space-y-3" data-testid="inbox-loading-more">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <TicketSkeletonCard key={`loading-more-${index}`} />
                  ))}
                </div>
              )}

              {hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    data-testid="inbox-load-more"
                  >
                    {isFetchingNextPage ? 'Loading more' : 'Load more'}
                  </Button>
                </div>
              )}

              {hasNextPage && <div ref={loadMoreRef} className="h-1" />}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
