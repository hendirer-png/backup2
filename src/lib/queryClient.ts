import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 1 minute
      staleTime: 60 * 1000,
      // Helps prevent excessive refetching when switching tabs
      refetchOnWindowFocus: false,
      // Retry failed queries 2 times by default
      retry: 2,
    },
  },
});
