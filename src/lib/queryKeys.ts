export const queryKeys = {
  authUser: ['auth', 'user'] as const,
  userPreferences: (userId?: string | null) => ['userPreferences', userId ?? 'anonymous'] as const,
  ticketsList: (filters?: { status?: string; query?: string }) =>
    ['tickets', 'list', filters?.status ?? 'all', filters?.query ?? ''] as const,
  actorsList: ['actors', 'list'] as const,
  ticketDetail: (ticketId: string) => ['tickets', 'detail', ticketId] as const,
};
