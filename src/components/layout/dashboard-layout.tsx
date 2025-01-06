"use client"

import { useState, useEffect, useRef } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { 
  LayoutGrid, 
  LineChart, 
  Brain, 
  Search, 
  BarChart3, 
  TrendingUp, 
  Menu,
  ChevronRight,
  ChevronLeft,
  Settings,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { searchStocks, type Stock } from "@/lib/api"

function SidebarItem({ 
  icon: Icon, 
  label, 
  href = "/", 
  isCollapsed = false 
}: { 
  icon: any
  label: string
  href?: string
  isCollapsed?: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white dark:text-white' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      setLoading(true)
      try {
        const data = await searchStocks(query)
        setResults(data)
        setIsOpen(true)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query])

  const handleSelectStock = (symbol: string) => {
    setIsOpen(false)
    setQuery("")
    router.push(`/stock/${symbol}`)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0F0F0F]">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden bg-white dark:bg-[#1C1C1C] border-r border-gray-200 dark:border-gray-800 duration-300 ease-linear lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-[72px]' : 'w-64'}`}
      >
        <div className={`flex items-center gap-2 px-4 py-4 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
          {!isCollapsed && <h2 className="text-xl font-bold text-gray-900 dark:text-white">Stock Analysis</h2>}
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear">
          <nav className="mt-2 px-3 space-y-1">
            <SidebarItem icon={LayoutGrid} label="Market Overview" href="/" isCollapsed={isCollapsed} />
            <SidebarItem icon={BarChart3} label="Stock Analysis" href="/analysis" isCollapsed={isCollapsed} />
            <SidebarItem icon={TrendingUp} label="Technical Analysis" href="/technical" isCollapsed={isCollapsed} />
            <SidebarItem icon={Brain} label="AI Insights" href="/insights" isCollapsed={isCollapsed} />
          </nav>

          <div className="mt-auto px-3 py-4 space-y-1">
            <SidebarItem icon={Settings} label="Settings" href="/settings" isCollapsed={isCollapsed} />
            <SidebarItem icon={HelpCircle} label="Help & Support" href="/help" isCollapsed={isCollapsed} />
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center h-10 w-full border-t border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </aside>

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 flex w-full bg-white dark:bg-[#1C1C1C] border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-grow items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div ref={searchRef} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search stocks..."
                  className="pl-10 pr-4 py-2 w-96 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  </div>
                )}

                {/* Search Results Dropdown */}
                {isOpen && results.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 w-96 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-[#1A1A1A]">
                    {results.map((stock) => (
                      <button
                        key={`${stock.symbol}-${stock.company_name}`}
                        onClick={() => handleSelectStock(stock.symbol)}
                        className="flex w-full items-center px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {stock.company_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ₹{stock.cmp}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {stock.symbol}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 