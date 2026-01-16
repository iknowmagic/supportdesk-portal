import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateTicketCommentMutation,
  useUpdateTicketAssigneeMutation,
  useUpdateTicketStatusMutation,
} from '@/hooks/useTicketActions';
import { listActors } from '@/lib/api/actors';
import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'closed', label: 'Closed' },
] as const;

type TicketStatus = (typeof STATUS_OPTIONS)[number]['value'];

type TicketActionsPanelProps = {
  ticketId: string;
  status: string;
  assignedToActorId: string | null;
};

const ASSIGNEE_UNASSIGNED = 'unassigned';

const resolveStatus = (value?: string | null): TicketStatus => {
  const match = STATUS_OPTIONS.find((option) => option.value === value);
  return match ? match.value : 'open';
};

const resolveAssigneeValue = (value?: string | null) => value ?? ASSIGNEE_UNASSIGNED;

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState('');
  const commentMutation = useCreateTicketCommentMutation();

  const canSubmit = body.trim().length > 0 && !commentMutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    commentMutation.mutate(
      { ticket_id: ticketId, body: body.trim() },
      {
        onSuccess: () => {
          toast.success('Reply sent');
          setBody('');
        },
        onError: () => {
          toast.error('Failed to send reply');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reply</CardTitle>
        <CardDescription>Share the next update with the requester.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="ticket-reply-body">Message</FieldLabel>
            <FieldContent>
              <Textarea
                id="ticket-reply-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Type your reply"
                data-testid="ticket-reply-body"
                disabled={commentMutation.isPending}
              />
            </FieldContent>
          </Field>
        </FieldGroup>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            data-testid="ticket-reply-submit"
          >
            {commentMutation.isPending ? 'Sending...' : 'Send reply'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TicketActionsPanel({ ticketId, status, assignedToActorId }: TicketActionsPanelProps) {
  const normalizedStatus = useMemo(() => resolveStatus(status), [status]);
  const normalizedAssignee = useMemo(() => resolveAssigneeValue(assignedToActorId), [assignedToActorId]);

  const [statusValue, setStatusValue] = useState<TicketStatus>(normalizedStatus);
  const [assigneeValue, setAssigneeValue] = useState<string>(normalizedAssignee);

  useEffect(() => {
    setStatusValue(normalizedStatus);
  }, [normalizedStatus]);

  useEffect(() => {
    setAssigneeValue(normalizedAssignee);
  }, [normalizedAssignee]);

  const statusMutation = useUpdateTicketStatusMutation();
  const assigneeMutation = useUpdateTicketAssigneeMutation();

  const actorsQuery = useQuery({
    queryKey: queryKeys.actorsList,
    queryFn: listActors,
    retry: false,
  });

  useEffect(() => {
    if (!actorsQuery.error) return;
    toast.error('Failed to load assignees');
  }, [actorsQuery.error]);

  const agents = useMemo(() => actorsQuery.data?.agents ?? [], [actorsQuery.data?.agents]);

  const statusDirty = statusValue !== normalizedStatus;
  const assigneeDirty = assigneeValue !== normalizedAssignee;

  const handleStatusUpdate = () => {
    if (!statusDirty || statusMutation.isPending) return;

    statusMutation.mutate(
      { ticket_id: ticketId, status: statusValue },
      {
        onSuccess: () => {
          toast.success('Status updated');
        },
        onError: () => {
          toast.error('Failed to update status');
        },
      }
    );
  };

  const handleAssigneeUpdate = () => {
    if (!assigneeDirty || assigneeMutation.isPending) return;

    assigneeMutation.mutate(
      {
        ticket_id: ticketId,
        assigned_to_actor_id: assigneeValue === ASSIGNEE_UNASSIGNED ? null : assigneeValue,
      },
      {
        onSuccess: () => {
          toast.success('Assignee updated');
        },
        onError: () => {
          toast.error('Failed to update assignee');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket actions</CardTitle>
        <CardDescription>Update the workflow and ownership.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <FieldGroup>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <FieldContent>
              <Select value={statusValue} onValueChange={(value) => setStatusValue(value as TicketStatus)}>
                <SelectTrigger data-testid="ticket-status-select" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleStatusUpdate}
              disabled={!statusDirty || statusMutation.isPending}
              data-testid="ticket-status-submit"
            >
              {statusMutation.isPending ? 'Updating...' : 'Update status'}
            </Button>
          </div>

          <Field>
            <FieldLabel>Assignee</FieldLabel>
            <FieldContent>
              <Select
                value={assigneeValue}
                onValueChange={setAssigneeValue}
                disabled={assigneeMutation.isPending}
              >
                <SelectTrigger data-testid="ticket-assignee-select" className="w-full">
                  <SelectValue
                    placeholder={actorsQuery.isLoading ? 'Loading agents...' : 'Select assignee'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ASSIGNEE_UNASSIGNED}>Unassigned</SelectItem>
                  {actorsQuery.isLoading ? (
                    <SelectItem value="loading-agents" disabled>
                      Loading agents...
                    </SelectItem>
                  ) : agents.length === 0 ? (
                    <SelectItem value="no-agents" disabled>
                      No agents available
                    </SelectItem>
                  ) : (
                    agents.map((actor) => (
                      <SelectItem key={actor.id} value={actor.id}>
                        {actor.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleAssigneeUpdate}
              disabled={!assigneeDirty || assigneeMutation.isPending}
              data-testid="ticket-assignee-submit"
            >
              {assigneeMutation.isPending ? 'Updating...' : 'Update assignee'}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
