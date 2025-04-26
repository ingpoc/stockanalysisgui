"use client"

import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PageContainer } from "@/components/layout/page-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStockData } from "@/hooks/useStockData"
import CompanyInfo from "@/components/stock/company-info"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Dynamically import heavy components
const StockChart = dynamic(() => import("@/components/stock-chart").then(mod => mod.StockChart), {
  loading: () => (
    <div className="h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
    </div>
  ),
  ssr: false
})

const AIInsights = dynamic(() => import("@/components/ai-insights").then(mod => mod.AIInsights), {
  loading: () => (
    <div className="animate-pulse p-6">
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-100 dark:bg-gray-900 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-900 rounded"></div>
      </div>
    </div>
  )
})

function StockDetailsPageSkeleton() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-10 w-full mb-6" /> 
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" /> 
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </PageContainer>
  )
}

export default function StockDetailsPage() {
  const params = useParams<{ symbol: string }>()
  const symbol = params?.symbol?.toUpperCase() || ''

  // Use the hook to fetch all necessary data
  const {
    stockDetails,
    isLoadingDetails,
    errorDetails,
    chartData,
    isLoadingChart,
    errorChart,
  } = useStockData(symbol)
  
  // Combine loading and error states
  const isLoading = isLoadingDetails
  const error = errorDetails

  if (isLoading) {
    return <StockDetailsPageSkeleton />
  }

  if (error) {
    return (
      <PageContainer>
         <div className="flex items-center justify-between mb-6">
           <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Error</h1>
           <Link href="/dashboard">
             <Button variant="outline" size="sm" className="gap-1.5">
               <ArrowLeft className="h-4 w-4" />
               Back
             </Button>
           </Link>
         </div>
         <Alert variant="destructive">
           <AlertTitle>Failed to Load Stock Data</AlertTitle>
           <AlertDescription>{error.message}</AlertDescription>
         </Alert>
      </PageContainer>
    )
  }
  
  if (!stockDetails) {
      return (
         <PageContainer>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Stock Not Found</h1>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
            <Alert variant="warning">
               <AlertTitle>Symbol Not Found</AlertTitle>
               <AlertDescription>The stock symbol "{symbol}" could not be found or data is unavailable.</AlertDescription>
             </Alert>
         </PageContainer>
      )
  }

  const { stock, formatted_metrics } = stockDetails
  const companyName = stock.company_name

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          {/* Placeholder for Logo */}
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-lg font-medium">
            {companyName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{companyName} ({symbol})</h1>
            <p className="text-sm text-muted-foreground">Stock Details & Analysis</p>
          </div>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Tabs for Content */}
      <Tabs defaultValue="company-info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company-info">Company Info</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Company Info Tab */}
        <TabsContent value="company-info">
           {/* Pass necessary data to CompanyInfo component */}
           <CompanyInfo symbol={symbol as string} /> 
        </TabsContent>

        {/* Chart Tab */}
        <TabsContent value="chart">
          <div className="rounded-lg bg-card p-6 shadow-sm border border-border">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Stock Price Chart</h2>
              <p className="text-sm text-muted-foreground mt-1">Historical price movement and trends</p>
              {/* TODO: Add Interval Selector for Chart */}
            </div>
            {/* Pass data/state from hook to the refactored StockChart */}
            <StockChart 
              chartData={chartData} 
              isLoading={isLoadingChart} 
              error={errorChart} 
            />
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights">
          {/* AIInsights component now uses the hook internally */}
          <AIInsights symbol={symbol as string} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
} 