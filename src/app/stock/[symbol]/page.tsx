"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getStockDetails, type StockDetailsResponse } from "@/lib/api"
import { ArrowLeft, TrendingUp, TrendingDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import { PageContainer } from "@/components/layout/page-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockChart } from "@/components/stock-chart"

function GrowthIndicator({ value }: { value: string }) {
  const numValue = Number(value?.replace('%', ''))
  const isPositive = numValue >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
      isPositive ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'
    }`}>
      <Icon className="w-3 h-3" />
      {value}
    </span>
  )
}

export default function StockDetailsPage() {
  const { symbol } = useParams()
  const [stockDetails, setStockDetails] = useState<StockDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStockDetails() {
      if (!symbol || typeof symbol !== 'string') return
      
      try {
        console.log('Fetching details for symbol:', symbol)
        const data = await getStockDetails(symbol)
        console.log('API Response:', JSON.stringify(data, null, 2))
        setStockDetails(data)
      } catch (error) {
        console.error('Failed to fetch stock details:', error)
        toast.error('Failed to fetch stock details. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadStockDetails()
  }, [symbol])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-900 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-900 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stockDetails) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Stock Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400">The requested stock could not be found.</p>
          <Link href="/">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { stock, formatted_metrics } = stockDetails
  const metrics = stock.financial_metrics[0] || {}

  const formatNetProfitGrowth = (value: string) => {
    // Remove any extra % signs and commas, then parse the number
    const cleanValue = value.replace(/%%$/, '%').replace(/,/g, '')
    const numValue = parseFloat(cleanValue)
    return `${numValue}%`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageContainer>
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{stock.company_name}</h1>
            <span className="text-lg text-gray-500 dark:text-gray-400">{symbol}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="company-info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="company-info">Company Info</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="company-info">
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h2>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CMP</dt>
                    <dd className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                      ₹{formatted_metrics.cmp}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Report Type</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">{metrics.report_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Result Date</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">{formatted_metrics.result_date || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quarter</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">{metrics.quarter || 'N/A'}</dd>
                  </div>
                </dl>
              </div>

              {/* Insights */}
              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Insights</h2>
                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Strengths</dt>
                    <dd className="mt-1 text-base font-medium text-green-600 dark:text-green-400 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      {formatted_metrics.strengths || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Weaknesses</dt>
                    <dd className="mt-1 text-base font-medium text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                      {formatted_metrics.weaknesses || 'N/A'}
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Technicals</dt>
                      <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                        {metrics.technicals_trend || 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Piotroski Score</dt>
                      <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                        {metrics.piotroski_score || 'N/A'}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Metrics */}
              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Growth Metrics</h2>
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Growth (3Y CAGR)</dt>
                    <dd className="mt-1">
                      <GrowthIndicator value={metrics.revenue_growth_3yr_cagr || '0%'} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit Growth (3Y CAGR)</dt>
                    <dd className="mt-1">
                      <GrowthIndicator value={metrics.net_profit_growth_3yr_cagr || '0%'} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Operating Profit Growth (3Y CAGR)</dt>
                    <dd className="mt-1">
                      <GrowthIndicator value={metrics.operating_profit_growth_3yr_cagr || '0%'} />
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Valuation Metrics */}
              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Valuation Metrics</h2>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">₹{metrics.market_cap || 'N/A'} Cr</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Face Value</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">₹{metrics.face_value || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Book Value</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">₹{metrics.book_value || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">TTM EPS</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">₹{metrics.ttm_eps || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">TTM P/E</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">{metrics.ttm_pe || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">P/B Ratio</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">{metrics.pb_ratio || 'N/A'}</dd>
                  </div>
                </dl>
              </div>

              {/* Financial Performance */}
              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Financial Performance</h2>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">₹{metrics.revenue || 'N/A'} Cr</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Growth</dt>
                    <dd className="mt-1">
                      <GrowthIndicator value={metrics.revenue_growth || '0%'} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gross Profit</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">₹{metrics.gross_profit || 'N/A'} Cr</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gross Profit Growth</dt>
                    <dd className="mt-1">
                      <GrowthIndicator value={metrics.gross_profit_growth || '0%'} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</dt>
                    <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">₹{metrics.net_profit || 'N/A'} Cr</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit Growth</dt>
                    <dd className="mt-1">
                      <GrowthIndicator value={formatted_metrics.net_profit_growth} />
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Recommendation Card */}
              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendation</h2>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-start gap-4">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        {formatted_metrics.recommendation || 'No recommendation available'}
                      </p>
                      {metrics.fundamental_insights_description && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                          {metrics.fundamental_insights_description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chart">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Price Chart</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Historical price movement and trends</p>
              </div>
              <StockChart symbol={symbol as string} />
            </div>
          </TabsContent>

          <TabsContent value="ai-insights">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Analysis</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Advanced AI insights coming soon</p>
              </div>
              <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
                Coming Soon
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </div>
  )
} 