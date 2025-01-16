"use client"

import { useState, useEffect } from "react"
import { fetchStockChart } from "@/lib/api"
import dynamic from "next/dynamic"

const DynamicChart = dynamic(() => import("./stock-chart-content"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
    </div>
  )
})

interface StockChartProps {
  symbol: string
  interval?: "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max"
}

interface ChartDataPoint {
  date: string
  close: number
}

export function StockChart({ symbol, interval = "1y" }: StockChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChartData() {
      try {
        setLoading(true)
        const data = await fetchStockChart(symbol, interval)
        setChartData(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch chart data:', err)
        setError('Failed to load chart data')
      } finally {
        setLoading(false)
      }
    }

    loadChartData()
  }, [symbol, interval])

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  return <DynamicChart data={chartData} />
} 