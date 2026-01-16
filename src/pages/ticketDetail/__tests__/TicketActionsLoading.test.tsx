import { TicketActionsPanel, TicketReplyForm } from '../TicketActionsPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('Ticket detail loading states', () => {
  it('renders a loading state for the reply form', () => {
    renderWithClient(<TicketReplyForm ticketId="loading" isLoading />);

    expect(screen.getByTestId('ticket-reply-loading')).toBeTruthy();
  });

  it('renders a loading state for ticket actions', () => {
    renderWithClient(
      <TicketActionsPanel
        ticketId="loading"
        status="open"
        assignedToActorId={null}
        isLoading
      />
    );

    expect(screen.getByTestId('ticket-actions-loading')).toBeTruthy();
  });
});
