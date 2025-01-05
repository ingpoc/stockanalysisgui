import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

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
          <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-[#1A1A1A] text-white p-4">
              <h1 className="text-xl font-semibold mb-8">Stock Analysis</h1>
              <nav className="space-y-2">
                <a href="#" className="flex items-center space-x-2 px-2 py-2 rounded-lg bg-blue-600 text-white">
                  <span className="text-sm">Market Overview</span>
                </a>
                <a href="#" className="flex items-center space-x-2 px-2 py-2 rounded-lg text-gray-400 hover:bg-[#2A2A2A]">
                  <span className="text-sm">Stock Analysis</span>
                </a>
                <a href="#" className="flex items-center space-x-2 px-2 py-2 rounded-lg text-gray-400 hover:bg-[#2A2A2A]">
                  <span className="text-sm">AI Insights</span>
                </a>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white dark:bg-[#0F0F0F] overflow-auto">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
