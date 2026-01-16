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
  actor_name: string;
  body: string;
  created_at: string;
};

export type TicketDetail = {
  ticket: TicketSummary;
  comments: TicketComment[];
};

type TicketsListResponse = {
  tickets: TicketSummary[];
};

type TicketDetailResponse = TicketDetail;

export async function listTickets(): Promise<TicketSummary[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('You must be logged in to view tickets.');
  }

  const { data, error } = await supabase.functions.invoke<TicketsListResponse>('tickets_list', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('You must be logged in to view tickets.');
  }

  const { data, error } = await supabase.functions.invoke<TicketDetailResponse>('ticket_detail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
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
