"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import ConnectButton from "@/components/auth/connect-button"
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
  HelpCircle,
  Ticket
  HelpCircle,
  Ticket
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { searchStocks, type Stock } from "@/lib/api"
import { memo } from "react"

function SidebarItem({ 
  icon: Icon, 
  label, 
  href = "/dashboard", 
  isCollapsed = false,
  onClick
}: { 
  icon: any
  label: string
  href?: string
  isCollapsed?: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = pathname === href

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onClick) {
      onClick()
    } else {
      router.push(href)
    }
  }

  return (
    <button 
      onClick={handleClick}
      className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white dark:text-white' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </button>
  )
}

const SearchResults = memo(function SearchResults({
  results,
  onSelect,
  loading
}: {
  results: Stock[]
  onSelect: (symbol: string) => void
  loading: boolean
}) {
  if (!results.length && !loading) return null;
  
  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 w-[32rem] overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-[#1A1A1A]">
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      ) : (
        results.map((stock) => (
          <button
            key={`${stock.symbol}-${stock.company_name}`}
            onClick={() => onSelect(stock.symbol)}
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
        ))
      )}
    </div>
  )
})

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Stock[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Memoized search handler
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setLoading(true)
    try {
      const data = await searchStocks(searchQuery)
      setResults(data)
      setIsOpen(true)
    } catch (error) {
      console.error('Failed to search stocks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => handleSearch(query), 300)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, handleSearch])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectStock = useCallback((symbol: string) => {
    setIsOpen(false)
    setQuery("")
    router.push(`/stock/${symbol}`)
  }, [router])

  // Memoize navigation items
  const navigationItems = useMemo(() => [
    { icon: LayoutGrid, label: "Market Overview", href: "/dashboard" },
    { icon: BarChart3, label: "Stock Analysis", href: "/analysis" },
    { icon: TrendingUp, label: "Technical Analysis", href: "/technical-analysis" },
    { icon: Brain, label: "AI Insights", href: "/ai-insights" },
    { icon: Ticket, label: "Crypto Lottery", href: "/lottery" },
  ], [])

  // Memoize footer items
  const footerItems = useMemo(() => [
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: HelpCircle, label: "Help & Support", href: "/help" },
  ], [])

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
              <SidebarItem icon={LayoutGrid} label="Market Overview" href="/dashboard" isCollapsed={isCollapsed} />
              <SidebarItem icon={BarChart3} label="Stock Analysis" href="/analysis" isCollapsed={isCollapsed} />
              <SidebarItem icon={TrendingUp} label="Technical Analysis" href="/technical-analysis" isCollapsed={isCollapsed} />
              <SidebarItem icon={Brain} label="AI Insights" href="/ai-insights" isCollapsed={isCollapsed} />
              <SidebarItem icon={Ticket} label="Crypto Lottery" href="/lottery" isCollapsed={isCollapsed} />
            </nav>

          <div className="mt-auto px-3 py-4 space-y-1">
            {footerItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isCollapsed={isCollapsed}
              />
            ))}
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
                  className="pl-10 pr-4 py-2 w-[32rem] rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  </div>
                )}

                {/* Search Results */}
                {isOpen && (
                  <SearchResults
                    results={results}
                    onSelect={handleSelectStock}
                    loading={loading}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <ConnectButton />
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