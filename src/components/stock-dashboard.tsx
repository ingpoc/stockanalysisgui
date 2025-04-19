"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { StockTable } from "@/components/stock-table"
import { refreshStockAnalysis, checkScrapingStatus, triggerScraper } from "@/services/marketDataService"
import { MarketOverview, StockCategory } from "@/types/market"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { PageContainer } from "@/components/layout/page-container"
import { useSearchParams, useRouter } from "next/navigation"
import { useMarketData } from "@/hooks/useMarketData"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Use the custom hook for market data logic
  const {
    marketData,
    loading,
    selectedQuarter,
    setSelectedQuarter,
    availableQuarters,
    loadMarketData,
    activeCategory,
    setActiveCategory,
  } = useMarketData();

  // Ref for URL updates remains
  const lastUrlUpdateRef = useRef<string | null>(null)

  // Update URL when activeCategory or selectedQuarter changes
  useEffect(() => {
    if (!selectedQuarter) return;
    
    // Create the new URL parameters
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', activeCategory);
    params.set('quarter', selectedQuarter);
    
    // Preserve the page parameter if it exists
    if (!params.has('page')) {
      params.set('page', '1');
    }
    
    const newUrl = `/dashboard?${params.toString()}`;
    
    // Only update if the URL would actually change
    if (lastUrlUpdateRef.current !== newUrl) {
      lastUrlUpdateRef.current = newUrl;
      router.push(newUrl, { scroll: false });
    }
  }, [activeCategory, selectedQuarter, router, searchParams]);

  // Handler for when the user selects a different quarter
  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter);
    // Data loading is handled by the useEffect in useMarketData hook
  };

  // Memoize stats 
  const stats = useMemo(() => {
    if (!marketData || !marketData.summary) {
      return { marketCap: "--", totalTrades: "--", avgVolume: "--", aiAnalyses: "--" };
    }
    const summary = marketData.summary;
    return {
      marketCap: summary.total_market_cap || "--",
      totalTrades: summary.total_trades?.toString() || "--",
      avgVolume: summary.average_volume || "--",
      aiAnalyses: summary.ai_analyses_count?.toString() || "--",
      // Add trend data if available in your API response
    };
  }, [marketData]);

  // Memoize table data
  const currentTableData = useMemo(() => {
    if (!marketData) return [];
    switch (activeCategory) {
      case "top-performers": return marketData.top_performers || [];
      case "worst-performers": return marketData.worst_performers || [];
      case "latest-results": return marketData.latest_results || [];
      case "all-stocks": return marketData.all_stocks || [];
      default: return [];
    }
  }, [marketData, activeCategory]);

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Market Cap" value={stats.marketCap} loading={loading} />
        <StatsCard title="Total Trades" value={stats.totalTrades} loading={loading} />
        <StatsCard title="Average Volume" value={stats.avgVolume} loading={loading} />
        <StatsCard title="AI Analyses" value={stats.aiAnalyses} loading={loading} />
      </div>

      {/* Market Overview Section */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Market Overview</h2>
          <div className="flex gap-2">
            {/* Replaced native select with shadcn/ui Select */}
            <Select 
              value={selectedQuarter}
              onValueChange={handleQuarterChange}
              disabled={loading || availableQuarters.length === 0}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={loading ? "Loading..." : "Select Quarter"} />
              </SelectTrigger>
              <SelectContent>
                {availableQuarters.map((q) => (
                  <SelectItem key={q} value={q}>
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Real-time market insights and analysis
        </p>

        {/* Tabs for Categories - Updated */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeCategory === tab.id
                    ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Stock Table - Updated */}
        <StockTable
          stocks={currentTableData}
        />
      </div>
    </PageContainer>
  );
} 