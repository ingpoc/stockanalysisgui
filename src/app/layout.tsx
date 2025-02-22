'use client'

import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { WalletConnectionProvider } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Stock Analysis Dashboard</title>
        <meta name="description" content="Advanced stock analysis powered by blockchain" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WalletConnectionProvider>
              {children}
            </WalletConnectionProvider>
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
