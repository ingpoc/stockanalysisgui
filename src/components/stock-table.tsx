"use client"

import { useEffect, useState } from "react"
import { fetchMarketData, type Stock, type MarketOverview } from "@/lib/api"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface StockTableProps {
  onStockSelect?: (symbol: string | null) => void
  selectedStock?: string | null
}

const ITEMS_PER_PAGE = 10

function generatePageNumbers(currentPage: number, totalPages: number) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  range.push(1);

  for (let i = currentPage - delta; i <= currentPage + delta; i++) {
    if (i < totalPages && i > 1) {
      range.push(i);
    }
  }

  range.push(totalPages);

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

export function StockTable({ onStockSelect, selectedStock }: StockTableProps) {
  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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
        <div className="h-8 bg-gray-100 dark:bg-[#222222] rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-50 dark:bg-[#222222]/50 rounded mb-2"></div>
        ))}
      </div>
    )
  }

  if (!marketData?.all_stocks?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    )
  }

  const totalPages = Math.ceil(marketData.all_stocks.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentStocks = marketData.all_stocks.slice(startIndex, endIndex)

  return (
    <div>
      <div className="min-w-full">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company Name</th>
              <th scope="col" className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CMP</th>
              <th scope="col" className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Profit Growth</th>
              <th scope="col" className="py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Strength</th>
              <th scope="col" className="py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weakness</th>
              <th scope="col" className="py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Piotroski Score</th>
              <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Result Date</th>
              <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {currentStocks.map((stock) => (
              <tr 
                key={`${stock.symbol}-${stock.company_name}`}
                className={`border-b border-gray-100 dark:border-gray-800/50 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#1A1A1A] ${
                  selectedStock === stock.symbol ? 'bg-gray-50 dark:bg-[#1A1A1A]' : ''
                }`}
                onClick={() => onStockSelect?.(selectedStock === stock.symbol ? null : stock.symbol)}
              >
                <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">{stock.company_name}</td>
                <td className="py-4 text-right text-sm text-gray-600 dark:text-gray-300">{stock.cmp}</td>
                <td className="py-4 text-right text-sm">
                  <span className={Number(stock.net_profit_growth) >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                    {stock.net_profit_growth}%
                  </span>
                </td>
                <td className="py-4 text-center text-sm">
                  <span className={stock.strengths === 'NA' ? 'text-gray-400 dark:text-gray-500' : 'text-green-600 dark:text-green-500'}>{stock.strengths}</span>
                </td>
                <td className="py-4 text-center text-sm">
                  <span className={stock.weaknesses === 'NA' ? 'text-gray-400 dark:text-gray-500' : 'text-red-600 dark:text-red-500'}>{stock.weaknesses}</span>
                </td>
                <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-300">{stock.piotroski_score}</td>
                <td className="py-4 text-sm text-gray-600 dark:text-gray-300">{stock.result_date}</td>
                <td className="py-4 text-sm">
                  <span className={
                    stock.recommendation === 'Strong Performer' ? 'text-yellow-600 dark:text-yellow-500' :
                    stock.recommendation === 'Mid-range performer' ? 'text-blue-600 dark:text-blue-500' :
                    'text-gray-400 dark:text-gray-500'
                  }>
                    {stock.recommendation === '--' ? '--' : stock.recommendation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, marketData.all_stocks.length)} of{' '}
            {marketData.all_stocks.length} entries
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {generatePageNumbers(currentPage, totalPages).map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`dot-${idx}`} className="px-2 text-gray-500 dark:text-gray-400">...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(Number(pageNum))}
                className={`min-w-[28px] h-7 text-xs rounded ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1A1A1A]'
                }`}
              >
                {pageNum}
              </button>
            )
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
} 