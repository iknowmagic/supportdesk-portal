export const queryKeys = {
  authUser: ['auth', 'user'] as const,
  userPreferences: (userId?: string | null) => ['userPreferences', userId ?? 'anonymous'] as const,
  tickets: ['tickets', 'list'] as const,
  ticketDetail: (ticketId: string) => ['tickets', 'detail', ticketId] as const,
};
