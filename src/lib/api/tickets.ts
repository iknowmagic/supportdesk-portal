import { getAccessToken } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase';

export type TicketSummary = {
  id: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  from_name: string;
  assigned_to_name: string | null;
  created_at: string;
  updated_at: string;
};

export type TicketComment = {
  id: string;
  ticket_id?: string;
  actor_id?: string;
  actor_name: string;
  body: string;
  created_at: string;
};

export type TicketDetail = {
  ticket: TicketSummary;
  comments: TicketComment[];
};

export type TicketCreateInput = {
  subject: string;
  body: string;
  from_actor_id: string;
  assigned_to_actor_id?: string | null;
  status?: string;
  priority?: string;
};

export type TicketCommentCreateInput = {
  ticket_id: string;
  body: string;
  actor_id?: string | null;
};

export type TicketStatusUpdateInput = {
  ticket_id: string;
  status: 'open' | 'pending' | 'closed';
};

export type TicketAssigneeUpdateInput = {
  ticket_id: string;
  assigned_to_actor_id?: string | null;
};

export type TicketsListFilters = {
  status?: string;
  query?: string;
};

type TicketsListResponse = {
  tickets: TicketSummary[];
};

type TicketDetailResponse = TicketDetail;
type TicketCreateResponse = {
  ticket: TicketSummary;
};
type TicketCommentCreateResponse = {
  comment: TicketComment;
};
type TicketStatusUpdateResponse = {
  ticket: {
    id: string;
    status: string;
    updated_at: string;
  };
};
type TicketAssigneeUpdateResponse = {
  ticket: {
    id: string;
    assigned_to_actor_id: string | null;
    assigned_to_name: string | null;
    updated_at: string;
  };
};

export async function listTickets(filters: TicketsListFilters = {}): Promise<TicketSummary[]> {
  const accessToken = await getAccessToken('You must be logged in to view tickets.');

  const { data, error } = await supabase.functions.invoke<TicketsListResponse>('tickets_list', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      status: filters.status,
      query: filters.query,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !Array.isArray(data.tickets)) {
    throw new Error('No tickets returned from server.');
  }

  return data.tickets;
}

export async function getTicketDetail(ticketId: string): Promise<TicketDetail> {
  if (!ticketId) {
    throw new Error('Missing ticket id.');
  }

  const accessToken = await getAccessToken('You must be logged in to view tickets.');

  const { data, error } = await supabase.functions.invoke<TicketDetailResponse>('ticket_detail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      ticketId,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.ticket) {
    throw new Error('No ticket returned from server.');
  }

  return {
    ticket: data.ticket,
    comments: Array.isArray(data.comments) ? data.comments : [],
  };
}

export async function createTicket(payload: TicketCreateInput): Promise<TicketSummary> {
  if (!payload.subject?.trim() || !payload.body?.trim() || !payload.from_actor_id?.trim()) {
    throw new Error('Missing required fields.');
  }

  const accessToken = await getAccessToken('You must be logged in to create tickets.');

  const { data, error } = await supabase.functions.invoke<TicketCreateResponse>('ticket_create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.ticket) {
    throw new Error('No ticket returned from server.');
  }

  return data.ticket;
}

export async function createTicketComment(payload: TicketCommentCreateInput): Promise<TicketComment> {
  if (!payload.ticket_id?.trim() || !payload.body?.trim()) {
    throw new Error('Missing required fields.');
  }

  const accessToken = await getAccessToken('You must be logged in to add comments.');

  const { data, error } = await supabase.functions.invoke<TicketCommentCreateResponse>('ticket_comment_create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.comment) {
    throw new Error('No comment returned from server.');
  }

  return data.comment;
}

export async function updateTicketStatus(payload: TicketStatusUpdateInput) {
  if (!payload.ticket_id?.trim() || !payload.status) {
    throw new Error('Missing required fields.');
  }

  const accessToken = await getAccessToken('You must be logged in to update ticket status.');

  const { data, error } = await supabase.functions.invoke<TicketStatusUpdateResponse>('ticket_status_update', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.ticket) {
    throw new Error('No ticket returned from server.');
  }

  return data.ticket;
}

export async function updateTicketAssignee(payload: TicketAssigneeUpdateInput) {
  if (!payload.ticket_id?.trim()) {
    throw new Error('Missing required fields.');
  }

  const accessToken = await getAccessToken('You must be logged in to update ticket assignee.');

  const { data, error } = await supabase.functions.invoke<TicketAssigneeUpdateResponse>('ticket_assignee_update', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.ticket) {
    throw new Error('No ticket returned from server.');
  }

  return data.ticket;
}
