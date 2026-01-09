export const queryKeys = {
  authUser: ['auth', 'user'] as const,
  userPreferences: (userId?: string | null) => ['userPreferences', userId ?? 'anonymous'] as const,
};
