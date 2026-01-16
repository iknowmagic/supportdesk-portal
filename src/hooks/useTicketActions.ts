import { createTicketComment, updateTicketAssignee, updateTicketStatus } from '@/lib/api/tickets';
import { queryKeys } from '@/lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateTicketCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicketComment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketDetail(variables.ticket_id) });
    },
  });
};

export const useUpdateTicketStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicketStatus,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketDetail(variables.ticket_id) });
    },
  });
};

export const useUpdateTicketAssigneeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicketAssignee,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ticketDetail(variables.ticket_id) });
    },
  });
};
