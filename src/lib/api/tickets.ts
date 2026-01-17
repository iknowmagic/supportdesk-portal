import { getAccessToken } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase';

export type TicketSummary = {
  id: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  from_actor_id?: string | null;
  from_name: string;
  assigned_to_actor_id?: string | null;
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
  offset?: number;
  limit?: number;
};

type TicketsListResponse = {
  tickets: TicketSummary[];
  total: number;
};
export type TicketsListResult = TicketsListResponse;

export type TicketSuggestion = {
  subject: string;
  matchStart: number;
  matchLength: number;
};
type TicketSuggestionsResponse = {
  suggestions: TicketSuggestion[];
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

const invokeTicketFunction = async <TResponse>(
  functionName: string,
  accessMessage: string,
  body: Record<string, unknown>
): Promise<TResponse | null> => {
  const accessToken = await getAccessToken(accessMessage);

  const { data, error } = await supabase.functions.invoke<TResponse>(functionName, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};

export async function listTickets(filters: TicketsListFilters = {}): Promise<TicketsListResult> {
  const accessToken = await getAccessToken('You must be logged in to view tickets.');
  const limit = typeof filters.limit === 'number' && Number.isFinite(filters.limit) ? filters.limit : undefined;
  const offset = typeof filters.offset === 'number' && Number.isFinite(filters.offset) ? filters.offset : undefined;

  const { data, error } = await supabase.functions.invoke<TicketsListResponse>('tickets_list', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      status: filters.status,
      query: filters.query,
      limit,
      offset,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !Array.isArray(data.tickets)) {
    throw new Error('No tickets returned from server.');
  }

  return {
    tickets: data.tickets,
    total: typeof data.total === 'number' ? data.total : data.tickets.length,
  };
}

export async function listTicketSuggestions(query: string): Promise<TicketSuggestion[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const data = await invokeTicketFunction<TicketSuggestionsResponse>(
    'tickets_suggest',
    'You must be logged in to search tickets.',
    { query: normalizedQuery }
  );

  if (!data || !Array.isArray(data.suggestions)) {
    throw new Error('No suggestions returned from server.');
  }

  return data.suggestions;
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

  const data = await invokeTicketFunction<TicketCreateResponse>(
    'ticket_create',
    'You must be logged in to create tickets.',
    payload
  );

  if (!data?.ticket) {
    throw new Error('No ticket returned from server.');
  }

  return data.ticket;
}

export async function createTicketComment(payload: TicketCommentCreateInput): Promise<TicketComment> {
  if (!payload.ticket_id?.trim() || !payload.body?.trim()) {
    throw new Error('Missing required fields.');
  }

  const data = await invokeTicketFunction<TicketCommentCreateResponse>(
    'ticket_comment_create',
    'You must be logged in to add comments.',
    payload
  );

  if (!data?.comment) {
    throw new Error('No comment returned from server.');
  }

  return data.comment;
}

export async function updateTicketStatus(payload: TicketStatusUpdateInput) {
  if (!payload.ticket_id?.trim() || !payload.status) {
    throw new Error('Missing required fields.');
  }

  const data = await invokeTicketFunction<TicketStatusUpdateResponse>(
    'ticket_status_update',
    'You must be logged in to update ticket status.',
    payload
  );

  if (!data?.ticket) {
    throw new Error('No ticket returned from server.');
  }

  return data.ticket;
}

export async function updateTicketAssignee(payload: TicketAssigneeUpdateInput) {
  if (!payload.ticket_id?.trim()) {
    throw new Error('Missing required fields.');
  }

  const data = await invokeTicketFunction<TicketAssigneeUpdateResponse>(
    'ticket_assignee_update',
    'You must be logged in to update ticket assignee.',
    payload
  );

  if (!data?.ticket) {
    throw new Error('No ticket returned from server.');
  }

  return data.ticket;
}
