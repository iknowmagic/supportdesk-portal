import { ModalShell } from "@/components/ModalShell";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { listActors } from "@/lib/api/actors";
import { createTicket } from "@/lib/api/tickets";
import { queryKeys } from "@/lib/queryKeys";
import { router } from "@/routes";
import { useNewTicketModal } from "@/store/ticketCreation/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const resetDraft = () => ({
  subject: "",
  body: "",
  status: "open",
  priority: "normal",
  fromActorId: "",
  assignedActorId: "unassigned",
});

export function NewTicketModal() {
  const { isOpen, setOpen } = useNewTicketModal();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(resetDraft);

  const actorsQuery = useQuery({
    queryKey: queryKeys.actorsList,
    queryFn: listActors,
    enabled: isOpen,
    retry: false,
  });

  useEffect(() => {
    if (!actorsQuery.error) return;
    toast.error("Failed to load actors", {
      description: actorsQuery.error instanceof Error ? actorsQuery.error.message : "Please try again.",
    });
  }, [actorsQuery.error]);

  const customers = useMemo(() => actorsQuery.data?.customers ?? [], [actorsQuery.data?.customers]);
  const agents = useMemo(() => actorsQuery.data?.agents ?? [], [actorsQuery.data?.agents]);

  const canSubmit =
    draft.subject.trim().length > 0 && draft.body.trim().length > 0 && draft.fromActorId.trim().length > 0;

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: async (ticket) => {
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket created");
      setOpen(false);
      setDraft(resetDraft());
      void router.navigate({ to: `/tickets/${ticket.id}` });
    },
    onError: (error) => {
      toast.error("Failed to create ticket", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setDraft(resetDraft());
    }
  };

  const handleSubmit = () => {
    if (!canSubmit || createMutation.isPending) return;

    createMutation.mutate({
      subject: draft.subject.trim(),
      body: draft.body.trim(),
      status: draft.status,
      priority: draft.priority,
      from_actor_id: draft.fromActorId,
      assigned_to_actor_id: draft.assignedActorId === "unassigned" ? null : draft.assignedActorId,
    });
  };

  return (
    <ModalShell
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="New ticket"
      description="Capture a customer issue and assign it to the right owner."
      onSave={handleSubmit}
      onCancel={() => handleOpenChange(false)}
      saveLabel={createMutation.isPending ? "Creating..." : "Create ticket"}
      isSaving={createMutation.isPending}
      saveButtonProps={{
        "data-testid": "new-ticket-submit",
        disabled: !canSubmit || createMutation.isPending,
      }}
    >
      <div data-testid="new-ticket-modal">
        <FieldGroup>
        <Field>
          <FieldLabel htmlFor="new-ticket-subject">Subject</FieldLabel>
          <FieldContent>
            <Input
              id="new-ticket-subject"
              value={draft.subject}
              onChange={(event) => setDraft((prev) => ({ ...prev, subject: event.target.value }))}
              placeholder="Short summary of the request"
              data-testid="new-ticket-subject"
              disabled={createMutation.isPending}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="new-ticket-body">Body</FieldLabel>
          <FieldContent>
            <Textarea
              id="new-ticket-body"
              value={draft.body}
              onChange={(event) => setDraft((prev) => ({ ...prev, body: event.target.value }))}
              placeholder="Add the details the team needs"
              data-testid="new-ticket-body"
              disabled={createMutation.isPending}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>From</FieldLabel>
          <FieldContent>
            <Select
              value={draft.fromActorId}
              onValueChange={(value) => setDraft((prev) => ({ ...prev, fromActorId: value }))}
              disabled={actorsQuery.isLoading || createMutation.isPending}
            >
              <SelectTrigger data-testid="new-ticket-from-actor">
                <SelectValue placeholder={actorsQuery.isLoading ? "Loading customers..." : "Select customer"} />
              </SelectTrigger>
              <SelectContent>
                {customers.length === 0 ? (
                  <SelectItem value="no-customers" disabled>
                    No customers found
                  </SelectItem>
                ) : (
                  customers.map((actor) => (
                    <SelectItem key={actor.id} value={actor.id}>
                      {actor.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Assignee</FieldLabel>
          <FieldContent>
            <Select
              value={draft.assignedActorId}
              onValueChange={(value) => setDraft((prev) => ({ ...prev, assignedActorId: value }))}
              disabled={actorsQuery.isLoading || createMutation.isPending}
            >
              <SelectTrigger data-testid="new-ticket-assignee">
                <SelectValue placeholder={actorsQuery.isLoading ? "Loading agents..." : "Select assignee"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {agents.map((actor) => (
                  <SelectItem key={actor.id} value={actor.id}>
                    {actor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <FieldContent>
            <Select
              value={draft.status}
              onValueChange={(value) => setDraft((prev) => ({ ...prev, status: value }))}
              disabled={createMutation.isPending}
            >
              <SelectTrigger data-testid="new-ticket-status">
                <SelectValue />
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

        <Field>
          <FieldLabel>Priority</FieldLabel>
          <FieldContent>
            <Select
              value={draft.priority}
              onValueChange={(value) => setDraft((prev) => ({ ...prev, priority: value }))}
              disabled={createMutation.isPending}
            >
              <SelectTrigger data-testid="new-ticket-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
        </FieldGroup>

        {createMutation.isPending && (
          <div
            className="text-muted-foreground dark:text-muted-foreground flex items-center gap-2 text-xs"
            data-testid="new-ticket-saving"
          >
            <Spinner className="size-3" />
            Creating ticket...
          </div>
        )}
      </div>
    </ModalShell>
  );
}
