import './globals.css'
import { headers } from 'next/headers'
import ContextProvider from '@/context'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata = {
  title: 'Stock Analysis Dashboard',
  description: 'Real-time stock analysis and insights',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const cookieStore = headersList.get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ContextProvider cookies={cookieStore}>
            {children}
          </ContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
