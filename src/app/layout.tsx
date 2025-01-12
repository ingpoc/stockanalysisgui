import './globals.css'
import { RootProvider } from '@/components/providers/root-provider'

export const metadata = {
  title: 'Stock Analysis Dashboard',
  description: 'Real-time stock analysis and insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
