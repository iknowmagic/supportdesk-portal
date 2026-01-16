import { AppShell } from '@/components/AppShell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getTicketDetail, type TicketComment, type TicketSummary } from '@/lib/api/tickets';
import { queryKeys } from '@/lib/queryKeys';
import { TicketActionsPanel, TicketReplyForm } from '@/pages/ticketDetail/TicketActionsPanel';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ArrowLeft, BadgeCheck, CalendarClock, MessageSquareText, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function TicketDetailPage() {
  const { ticketId } = useParams({ from: '/tickets/$ticketId' });
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.ticketDetail(ticketId),
    queryFn: () => getTicketDetail(ticketId),
    retry: false,
  });

  useEffect(() => {
    if (!error) return;
    toast.error('Failed to load ticket', {
      description: error instanceof Error ? error.message : 'Please try again.',
    });
  }, [error]);

  const ticket = data?.ticket;
  const comments = data?.comments ?? [];

  const lastReply = comments[comments.length - 1];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/inbox' })}>
              <ArrowLeft className="size-4" />
            </Button>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Ticket</p>
              {isLoading ? (
                <Skeleton className="h-7 w-64" />
              ) : (
                <h1 className="text-2xl font-semibold">{ticket?.subject ?? 'Ticket details'}</h1>
              )}
              <div className="text-muted-foreground text-sm">
                {isLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  `ID ${ticket?.id ?? ticketId}`
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-20" />
              </>
            ) : (
              <>
                {ticket && <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>}
                {ticket && <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>}
              </>
            )}
          </div>
        </div>

        {error ? (
          <Card data-testid="ticket-detail-error-state">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <MessageSquareText className="text-muted-foreground dark:text-muted-foreground size-10" />
              <div className="space-y-1">
                <h3 className="text-foreground dark:text-foreground text-lg font-semibold">
                  Unable to load ticket
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm">
                  Please try again in a moment.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => refetch()}
                data-testid="ticket-detail-retry"
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>Request summary and latest context.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-10/12" />
                    </div>
                  ) : (
                    <p className="text-foreground text-sm leading-relaxed">{ticket?.body}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Conversation</CardTitle>
                      <CardDescription>All messages on this ticket.</CardDescription>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <MessageSquareText className="size-4" />
                      {isLoading ? <Skeleton className="h-4 w-10" /> : `${comments.length} replies`}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-11/12" />
                      <Skeleton className="h-14 w-10/12" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
                      No replies yet. This conversation is ready for the first response.
                    </div>
                  ) : (
                    <ScrollArea className="h-[360px] pr-4">
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <CommentRow key={comment.id} comment={comment} />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <TicketReplyForm ticketId={ticket?.id ?? ticketId} isLoading={isLoading} />
            </div>

            <div className="space-y-6">
              <TicketActionsPanel
                ticketId={ticket?.id ?? ticketId}
                status={ticket?.status ?? 'open'}
                assignedToActorId={ticket?.assigned_to_actor_id ?? null}
                isLoading={isLoading}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Ticket details</CardTitle>
                  <CardDescription>Assignment and timestamps.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <DetailRow
                    label="Requester"
                    value={ticket?.from_name ?? (isLoading ? null : 'Unknown')}
                    icon={<UserRound className="size-4" />}
                    loading={isLoading}
                  />
                  <DetailRow
                    label="Assignee"
                    value={ticket?.assigned_to_name ?? (isLoading ? null : 'Unassigned')}
                    icon={<BadgeCheck className="size-4" />}
                    loading={isLoading}
                  />
                  <Separator />
                  <DetailRow
                    label="Created"
                    value={ticket?.created_at ? formatTimestamp(ticket.created_at) : null}
                    icon={<CalendarClock className="size-4" />}
                    loading={isLoading}
                  />
                  <DetailRow
                    label="Last updated"
                    value={ticket?.updated_at ? formatTimestamp(ticket.updated_at) : null}
                    icon={<CalendarClock className="size-4" />}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity highlights</CardTitle>
                  <CardDescription>Quick context for this thread.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <DetailRow
                    label="Replies"
                    value={isLoading ? null : `${comments.length}`}
                    icon={<MessageSquareText className="size-4" />}
                    loading={isLoading}
                  />
                  <DetailRow
                    label="Last reply"
                    value={lastReply?.created_at ? formatTimestamp(lastReply.created_at) : 'No replies yet'}
                    icon={<CalendarClock className="size-4" />}
                    loading={isLoading}
                  />
                  <DetailRow
                    label="Last responder"
                    value={lastReply?.actor_name ?? '—'}
                    icon={<UserRound className="size-4" />}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CommentRow({ comment }: { comment: TicketComment }) {
  const initials = getInitials(comment.actor_name);

  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1 rounded-lg border bg-background p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">{comment.actor_name}</p>
          <span className="text-muted-foreground text-xs">{formatTimestamp(comment.created_at)}</span>
        </div>
        <p className="text-foreground text-sm">{comment.body}</p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: string | null;
  icon: ReactNode;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-muted-foreground flex items-center gap-2 text-xs uppercase tracking-wide">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </div>
      {loading ? <Skeleton className="h-4 w-28" /> : <span className="text-sm font-medium">{value}</span>}
    </div>
  );
}

function formatTimestamp(value: string) {
  return format(new Date(value), 'MMM d, yyyy • h:mm a');
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function getStatusColor(status: TicketSummary['status']) {
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
}

function getPriorityColor(priority: TicketSummary['priority']) {
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
}
