import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import ContextProvider from '@/context'
import { useAppKitProvider } from '@reown/appkit/react'
import { modal } from '@/config'
import { CreateLotteryDialog } from '@/components/lottery/create-lottery-dialog'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stock Analysis Dashboard',
  description: 'Real-time stock analysis and insights',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersData = await headers()
  const cookies = headersData.get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ContextProvider cookies={cookies}>
          {children}
  
          <Toaster />
        </ContextProvider>
      </body>
    </html>
  )
}
