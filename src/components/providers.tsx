'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { WalletConnectionProvider } from '@/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import logger to initialize it
import '@/lib/logger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // For real-time blockchain data, keep it fresh
      staleTime: 5000, // 5 seconds - data is fresh for this long
      gcTime: 30000, // 30 seconds - keep in cache for this long when unused
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when internet reconnects
      retry: (failureCount, error: any) => {
        // Don't retry rate limit errors (429) or blockchain errors
        if (error?.message?.includes('429') || error?.message?.includes('Rate limit')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1, // Only retry mutations once
      retryDelay: 1000, // 1 second delay
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute='class'
        defaultTheme='system'
        enableSystem
        disableTransitionOnChange
      >
        <WalletConnectionProvider>{children}</WalletConnectionProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
