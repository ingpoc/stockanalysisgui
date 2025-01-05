"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchMarketData, type Stock, type MarketOverview } from "@/lib/api"

interface StockTableProps {
  onStockSelect?: (symbol: string | null) => void
  selectedStock?: string | null
}

export function StockTable({ onStockSelect, selectedStock }: StockTableProps) {
  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMarketData() {
      try {
        const data = await fetchMarketData()
        setMarketData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data')
      } finally {
        setLoading(false)
      }
    }

    loadMarketData()
  }, [])

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/10 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
        ))}
      </div>
    )
  }

  if (!marketData) {
    return null
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead className="text-right">CMP</TableHead>
            <TableHead className="text-right">Net Profit Growth</TableHead>
            <TableHead className="text-center">Strength</TableHead>
            <TableHead className="text-center">Weakness</TableHead>
            <TableHead className="text-center">Piotroski Score</TableHead>
            <TableHead>Result Date</TableHead>
            <TableHead>Recommendation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marketData.all_stocks.map((stock) => (
            <TableRow 
              key={stock.symbol}
              className={`cursor-pointer hover:bg-muted/50 ${selectedStock === stock.symbol ? 'bg-muted' : ''}`}
              onClick={() => onStockSelect?.(selectedStock === stock.symbol ? null : stock.symbol)}
            >
              <TableCell className="font-medium">{stock.company_name}</TableCell>
              <TableCell className="text-right">{stock.cmp}</TableCell>
              <TableCell className="text-right">
                <span className={Number(stock.net_profit_growth) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {stock.net_profit_growth}%
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-green-600 dark:text-green-400">{stock.strengths}</span>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-red-600 dark:text-red-400">{stock.weaknesses}</span>
              </TableCell>
              <TableCell className="text-center">{stock.piotroski_score}</TableCell>
              <TableCell>{stock.result_date}</TableCell>
              <TableCell>
                <span className={
                  stock.recommendation === 'Buy' ? 'text-green-600 dark:text-green-400' :
                  stock.recommendation === 'Sell' ? 'text-red-600 dark:text-red-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }>
                  {stock.recommendation}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 