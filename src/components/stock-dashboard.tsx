"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StockTable } from "@/components/stock-table"
import { ModeToggle } from "@/components/mode-toggle"
import { refreshStockAnalysis } from "@/lib/api"

export function StockDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  const handleRefresh = async () => {
    if (!selectedStock) {
      console.warn('No stock selected for refresh')
      return
    }

    setIsRefreshing(true)
    try {
      await refreshStockAnalysis(selectedStock)
      // Trigger a re-fetch in the StockTable component
      window.location.reload()
    } catch (error) {
      console.error('Failed to refresh:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
          <span className="text-sm text-muted-foreground">Real-time market insights</span>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing || !selectedStock}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRefreshing ? "Refreshing..." : "Refresh AI Analysis"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <Card className="p-6">
          <StockTable onStockSelect={setSelectedStock} selectedStock={selectedStock} />
        </Card>
      </div>
    </div>
  )
} 