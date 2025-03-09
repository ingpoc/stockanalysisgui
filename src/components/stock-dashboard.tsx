"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { StockTable } from "@/components/stock-table"
import { refreshStockAnalysis, fetchMarketData, getQuarters, type MarketOverview } from "@/lib/api"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { PageContainer } from "@/components/layout/page-container"
import { useSearchParams, useRouter } from "next/navigation"

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
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Read category, page, and quarter from URL parameters
  const categoryParam = searchParams.get('category') as StockCategory | null
  const pageParam = searchParams.get('page')
  const quarterParam = searchParams.get('quarter')
  
  // UseRef to avoid re-renders for tracking state
  const isFetchingRef = useRef(false)
  const lastQuarterFetchedRef = useRef<string | null>(null)
  const lastUrlUpdateRef = useRef<string | null>(null)
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedQuarter, setSelectedQuarter] = useState<string>("")
  const [quarters, setQuarters] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<StockCategory>(
    categoryParam && ["top-performers", "worst-performers", "latest-results", "all-stocks"].includes(categoryParam) 
    ? categoryParam 
    : "top-performers"
  )
  const [lastDataFetchTime, setLastDataFetchTime] = useState<number>(0)
  const [fetchErrors, setFetchErrors] = useState<number>(0)

  // Load quarters only once on component mount
  useEffect(() => {
    const abortController = new AbortController()

    async function loadQuarters() {
      try {
        const data = await getQuarters(abortController.signal)
        if (data.length > 0) {
          setQuarters(data)
          
          // Use quarter from URL if available and valid, otherwise use the first quarter
          if (quarterParam && data.includes(quarterParam)) {
            setSelectedQuarter(quarterParam)
          } else {
            setSelectedQuarter(data[0])
          }
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
  }, [quarterParam]) // Only depends on quarterParam

  // Create a function for loading market data (not memoized to avoid dependency issues)
  const loadMarketData = async (quarter: string, forceRefresh: boolean = false) => {
    // Prevent multiple concurrent fetches for the same quarter
    if (isFetchingRef.current && lastQuarterFetchedRef.current === quarter && !forceRefresh) {
      console.log(`Already fetching data for ${quarter}, skipping duplicate request`);
      return;
    }
    
    if (!quarter) return;
    
    isFetchingRef.current = true;
    lastQuarterFetchedRef.current = quarter;
    
    setLoading(true);
    try {
      console.log(`Fetching market data for quarter: ${quarter}${forceRefresh ? ' (forced refresh)' : ''}`);
      const data = await fetchMarketData(quarter, forceRefresh);
      setMarketData(data);
      setLastDataFetchTime(Date.now());
      setFetchErrors(0); // Reset error count on successful fetch
      
      // Check if we got any data
      const hasData = data && 
        (data.all_stocks?.length || 
         data.top_performers?.length || 
         data.latest_results?.length || 
         data.worst_performers?.length);
      
      if (!hasData && !forceRefresh) {
        // If no data and we haven't tried a forced refresh yet, try once more with force refresh
        console.log('No data received. Trying with force refresh...');
        await loadMarketData(quarter, true);
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      toast.error('Failed to fetch market data. Trying again...');
      setFetchErrors(prev => prev + 1);
      
      // If we've had multiple errors, try with force refresh
      if (fetchErrors >= 1 && !forceRefresh) {
        try {
          console.log('Multiple fetch errors. Trying with force refresh...');
          await loadMarketData(quarter, true);
        } catch (retryError) {
          console.error('Retry with force refresh also failed:', retryError);
          toast.error('Still unable to fetch market data. Please try again later.');
        }
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Load market data when quarter changes
  useEffect(() => {
    if (!selectedQuarter) return;
    
    // Prevent excessive data loading when switching between pages but not changing quarter
    if (lastQuarterFetchedRef.current === selectedQuarter) {
      const currentTime = Date.now();
      const timeSinceLastFetch = currentTime - lastDataFetchTime;
      
      // Only refetch if it's been more than 5 minutes or there were errors
      if (timeSinceLastFetch < 300000 && fetchErrors === 0) {
        console.log(`Using existing data for ${selectedQuarter}, fetched ${timeSinceLastFetch}ms ago`);
        return;
      }
    }
    
    // Load market data (using a clean function call, not a function reference)
    loadMarketData(selectedQuarter, false);
    
  }, [selectedQuarter, lastDataFetchTime, fetchErrors]);

  // Update URL when activeCategory or selectedQuarter changes, but avoid unnecessary updates
  useEffect(() => {
    if (!selectedQuarter) return;
    
    // Create the new URL parameters
    const params = new URLSearchParams();
    params.set('category', activeCategory);
    params.set('quarter', selectedQuarter);
    
    // Preserve the page parameter if it exists
    const currentPage = searchParams.get('page');
    if (currentPage) {
      params.set('page', currentPage);
    } else {
      params.set('page', '1');
    }
    
    const newUrl = `/dashboard?${params.toString()}`;
    
    // Only update if the URL would actually change
    if (lastUrlUpdateRef.current !== newUrl) {
      lastUrlUpdateRef.current = newUrl;
      router.push(newUrl, { scroll: false });
    }
  }, [activeCategory, selectedQuarter, router, searchParams]);

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
          await loadMarketData(selectedQuarter, true) // Force refresh after analysis
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
    // Note: URL will be updated by the useEffect above
  }

  const handleManualRefresh = async () => {
    if (loading || isRefreshing) return;
    
    try {
      toast.info('Refreshing market data...')
      await loadMarketData(selectedQuarter, true); // Force refresh
      toast.success('Market data refreshed successfully')
    } catch (error) {
      console.error('Failed to manually refresh market data:', error)
      toast.error('Failed to refresh market data. Please try again later.')
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
            <div className="flex gap-2">
              <Button
                onClick={handleManualRefresh}
                disabled={loading || isRefreshing}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
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
          currentQuarter={selectedQuarter}
        />
      </div>
    </PageContainer>
  )
} 