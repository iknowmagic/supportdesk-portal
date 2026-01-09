import { getQueryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';

export function Provider({ children }: { children: React.ReactNode }) {
  // Get singleton QueryClient (prevents duplicate API calls in StrictMode)
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
