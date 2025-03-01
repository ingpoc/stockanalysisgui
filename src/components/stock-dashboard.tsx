"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { StockTable } from "@/components/stock-table"
import { refreshStockAnalysis, fetchMarketData, getQuarters, type MarketOverview } from "@/lib/api"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { PageContainer } from "@/components/layout/page-container"

type StockCategory = "top-performers" | "worst-performers" | "latest-results" | "all-stocks"

const TABS = [
  { id: "top-performers", label: "Top Performers" },
  { id: "worst-performers", label: "Worst Performers" },
  { id: "latest-results", label: "Latest Results" },
  { id: "all-stocks", label: "All Stocks" },
] as const

function StatsCard({ title, value, trend, trendValue, loading }: {
  title: string
  value: string
  trend?: "up" | "down"
  trendValue?: string
  loading?: boolean
}) {
  return (
    <div className="rounded-lg bg-white dark:bg-[#1A1A1A] p-4 shadow-sm">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-medium text-gray-900 dark:text-white">{value}</h3>
            {trend && trendValue && (
              <span className={`text-sm ${trend === "up" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                {trend === "up" ? "↑" : "↓"} {trendValue}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function StockDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedQuarter, setSelectedQuarter] = useState<string>("")
  const [quarters, setQuarters] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<StockCategory>("top-performers")

  // Load quarters only once on component mount
  useEffect(() => {
    const abortController = new AbortController()

    async function loadQuarters() {
      try {
        const data = await getQuarters(abortController.signal)
        if (data.length > 0) {
          setQuarters(data)
          setSelectedQuarter(data[0])
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Failed to fetch quarters:', error)
          toast.error('Failed to fetch quarters. Please try again later.')
        }
      }
    }

    loadQuarters()

    return () => {
      abortController.abort()
    }
  }, [])

  // Load market data when quarter changes
  useEffect(() => {
    let mounted = true

    async function loadMarketData() {
      if (!selectedQuarter) return
      
      setLoading(true)
      try {
        const data = await fetchMarketData(selectedQuarter)
        if (mounted) {
          setMarketData(data)
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error)
        if (mounted) {
          toast.error('Failed to fetch market data. Please try again later.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadMarketData()

    return () => {
      mounted = false
    }
  }, [selectedQuarter])

  const handleRefresh = async () => {
    if (!selectedStock) {
      toast.error('Please select a stock to refresh', {
        description: 'You must select a stock before refreshing analysis'
      })
      return
    }

    setIsRefreshing(true)
    try {
      await toast.promise(
        async () => {
          await refreshStockAnalysis(selectedStock)
          const data = await fetchMarketData(selectedQuarter)
          setMarketData(data)
        },
        {
          loading: 'Refreshing analysis...',
          success: 'Analysis refreshed successfully',
          error: 'Failed to refresh analysis. Please try again.'
        }
      )
    } catch (error) {
      console.error('Failed to refresh:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleQuarterChange = (quarter: string) => {
    setSelectedStock(null) // Reset selected stock when quarter changes
    setSelectedQuarter(quarter)
  }

  // Calculate market statistics
  const marketStats = {
    marketCap: marketData?.all_stocks?.reduce((sum, stock) => sum + (parseFloat(stock.cmp) || 0), 0) || 0,
    totalTrades: marketData?.all_stocks?.length || 0,
    avgVolume: marketData?.all_stocks?.length 
      ? (marketData.all_stocks.reduce((sum, stock) => sum + (parseFloat(stock.cmp) || 0), 0) / marketData.all_stocks.length)
      : 0,
    aiAnalyses: marketData?.all_stocks?.filter(stock => stock.recommendation !== '--').length || 0
  }

  const getCurrentStocks = () => {
    if (!marketData) return []
    switch (activeCategory) {
      case "top-performers":
        return marketData.top_performers || []
      case "worst-performers":
        return marketData.worst_performers || []
      case "latest-results":
        return marketData.latest_results || []
      case "all-stocks":
        return marketData.all_stocks || []
      default:
        return []
    }
  }

  return (
    <PageContainer>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 mb-6">
        <StatsCard
          title="Market Cap"
          value={`₹${(marketStats.marketCap / 1e12).toFixed(1)}T`}
          trend="up"
          trendValue="2.5%"
          loading={loading}
        />
        <StatsCard
          title="Total Trades"
          value={`${marketStats.totalTrades}`}
          trend="up"
          trendValue="10.5%"
          loading={loading}
        />
        <StatsCard
          title="Average Volume"
          value={`${marketStats.avgVolume.toFixed(1)}M`}
          trend="down"
          trendValue="3.2%"
          loading={loading}
        />
        <StatsCard
          title="AI Analyses"
          value={`${marketStats.aiAnalyses}`}
          trend="up"
          trendValue="12.8%"
          loading={loading}
        />
      </div>

      {/* Main Content */}
      <div className="rounded-lg bg-white dark:bg-[#1A1A1A] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Market Overview</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time market insights and analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedQuarter}
              onChange={(e) => handleQuarterChange(e.target.value)}
              className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
            >
              {quarters.map((quarter) => (
                <option key={quarter} value={quarter}>
                  {quarter}
                </option>
              ))}
            </select>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || !selectedStock}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? "Refreshing..." : "Refresh Analysis"}
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeCategory === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <StockTable 
          onStockSelect={setSelectedStock} 
          selectedStock={selectedStock}
          stocks={getCurrentStocks()}
        />
      </div>
    </PageContainer>
  )
} 