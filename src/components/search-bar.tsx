"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { type Stock } from "@/lib/api"
import { searchStocks } from "@/lib/api"

interface SearchBarProps {
  currentQuarter?: string
}

export function SearchBar({ currentQuarter }: SearchBarProps) {
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
        // Filter all stocks from market data based on query
        const data = await searchStocks(query, currentQuarter)
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
  }, [query, currentQuarter])

  const handleSelectStock = (symbol: string) => {
    setIsOpen(false)
    setQuery("")
    router.push(`/stock/${symbol}`)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search stocks..."
          className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-800 dark:bg-[#1A1A1A] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-[#1A1A1A]">
          {results.map((stock) => (
            <button
              key={`${stock.symbol}-${stock.company_name}`}
              onClick={() => handleSelectStock(stock.symbol)}
              className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {stock.company_name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stock.symbol} • ₹{stock.cmp}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 