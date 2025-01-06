import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Stock Analysis Dashboard",
  description: "Real-time stock analysis and insights",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DashboardLayout>
            {children}
          </DashboardLayout>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
