'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, type Config } from 'wagmi'
import { ThemeProvider } from '@/components/theme-provider'
import { config } from '@/config'
import { useAppKitProvider } from '@reown/appkit/react'
import { DisconnectHandler } from '@/components/auth/disconnect-handler'

const queryClient = new QueryClient()

export function AppKitClientProvider({ children }: { children: ReactNode }) {
  useAppKitProvider('eip155' as const)
  return <>{children}</>
}

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config as Config}>
      <QueryClientProvider client={queryClient}>
        <AppKitClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DisconnectHandler />
            {children}
          </ThemeProvider>
        </AppKitClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 