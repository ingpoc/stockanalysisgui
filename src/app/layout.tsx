import "./globals.css"
import type { ReactNode } from 'react'
import { Toaster } from "sonner"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Providers } from "@/auth/providers"

export const metadata = {
  title: "Stock Analysis Dashboard",
  description: "Real-time stock analysis and insights",
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <DashboardLayout>
            {children}
          </DashboardLayout>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
