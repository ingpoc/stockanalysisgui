'use client'

import { wagmiAdapter, solanaWeb3JsAdapter, projectId, networks } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { ThemeProvider } from '@/components/theme-provider'

// Set up queryClient
const queryClient = new QueryClient()
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'








function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider