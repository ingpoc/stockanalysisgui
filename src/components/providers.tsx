'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { WalletConnectionProvider } from '@/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import logger to initialize it
import '@/lib/logger';

const queryClient = new QueryClient();

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
