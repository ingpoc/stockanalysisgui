'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { WalletConnectionProvider } from '@/config'
import { Toaster } from '@/components/ui/toaster'

const queryClient = new QueryClient()

export default function ContextProvider({
  children,
  cookies,
}: {
  children: React.ReactNode
  cookies?: string
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <WalletConnectionProvider>
          {children}
          <Toaster />
        </WalletConnectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
} 