"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { StockTable } from "@/components/stock-table"
import { refreshStockAnalysis, fetchMarketData, type MarketOverview } from "@/lib/api"
import { RefreshCw } from "lucide-react"

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

  useEffect(() => {
    async function loadMarketData() {
      try {
        const data = await fetchMarketData()
        setMarketData(data)
      } catch (error) {
        console.error('Failed to fetch market data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMarketData()
  }, [])

  const handleRefresh = async () => {
    if (!selectedStock) {
      console.warn('No stock selected for refresh')
      return
    }

    setIsRefreshing(true)
    try {
      await refreshStockAnalysis(selectedStock)
      // Refresh market data
      const data = await fetchMarketData()
      setMarketData(data)
    } catch (error) {
      console.error('Failed to refresh:', error)
    } finally {
      setIsRefreshing(false)
    }
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

  return (
    <div className="p-4 md:p-6 2xl:p-10">
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
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || !selectedStock}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Analysis"}
          </Button>
        </div>

        <StockTable onStockSelect={setSelectedStock} selectedStock={selectedStock} />
      </div>
    </div>
  )
} 