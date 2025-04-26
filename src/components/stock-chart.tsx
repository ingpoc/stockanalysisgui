"use client"

import dynamic from "next/dynamic"

// Assume ChartDataPoint is defined elsewhere or import if needed
interface ChartDataPoint {
  date: string
  close: number
}

// Dynamic import for the actual chart rendering component
const DynamicChart = dynamic(() => import("./stock-chart-content"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
    </div>
  )
})

// Define props for the simplified StockChart component
interface StockChartProps {
  chartData: ChartDataPoint[] | undefined // Data comes from the hook via parent
  isLoading: boolean // Loading state comes from the hook via parent
  error: Error | null // Error state comes from the hook via parent
}

// Simplified StockChart component: receives data and state via props
export function StockChart({ chartData, isLoading, error }: StockChartProps) {

  // Display loading state
  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  // Display error state
  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">Error loading chart: {error.message}</p>
      </div>
    )
  }
  
  // Display chart if data is available
  if (!chartData || chartData.length === 0) {
      return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No chart data available.</p>
      </div>
    )
  }

  return <DynamicChart data={chartData} />
} 