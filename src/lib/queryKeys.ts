export const queryKeys = {
  authUser: ['auth', 'user'] as const,
  userPreferences: (userId?: string | null) => ['userPreferences', userId ?? 'anonymous'] as const,
  ticketsList: (filters?: {
    status?: string;
    priority?: string;
    assignee?: string;
    query?: string;
    field?: string;
    limit?: number;
  }) =>
    [
      'tickets',
      'list',
      filters?.status ?? 'all',
      filters?.priority ?? 'all',
      filters?.assignee ?? '',
      filters?.field ?? 'all',
      filters?.query ?? '',
      filters?.limit ?? 'default',
    ] as const,
  ticketSuggestions: (query?: string) => ['tickets', 'suggestions', query ?? ''] as const,
  actorsList: ['actors', 'list'] as const,
  ticketDetail: (ticketId: string) => ['tickets', 'detail', ticketId] as const,
};
