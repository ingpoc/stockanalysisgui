'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, type Config } from 'wagmi'
import { cookieToInitialState } from 'wagmi'
import { config } from '@/config'
import { useAppKitProvider } from '@reown/appkit/react'
import { ThemeProvider } from '@/components/theme-provider'
import React, { type ReactNode } from 'react'

// Set up queryClient
const queryClient = new QueryClient()

function AppKitClientProvider({ children }: { children: ReactNode }) {
  useAppKitProvider('eip155' as const)
  return <>{children}</>
}

export default function ContextProvider({ 
  children, 
  cookies 
}: { 
  children: ReactNode
  cookies: string | null 
}) {
  const initialState = cookieToInitialState(config as Config, cookies)

  return (
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <AppKitClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AppKitClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 