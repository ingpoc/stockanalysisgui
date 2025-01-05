"use client"

import { useState } from "react"
import { type Stock } from "@/lib/api"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface StockTableProps {
  onStockSelect?: (symbol: string | null) => void
  selectedStock?: string | null
  stocks: Stock[]
}

const ITEMS_PER_PAGE = 10

function generatePageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages
  ]
}

export function StockTable({ onStockSelect, selectedStock, stocks }: StockTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  if (!stocks?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    )
  }

  const totalPages = Math.ceil(stocks.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentStocks = stocks.slice(startIndex, endIndex)

  const handleDoubleClick = (symbol: string) => {
    router.push(`/stock/${symbol}`)
  }

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
                onDoubleClick={() => handleDoubleClick(stock.symbol)}
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
            Showing {startIndex + 1} to {Math.min(endIndex, stocks.length)} of{' '}
            {stocks.length} entries
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
          
          <div className="flex items-center">
            {generatePageNumbers(currentPage, totalPages).map((pageNum, idx) => (
              typeof pageNum === 'string' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 dark:text-gray-400">
                  {pageNum}
                </span>
              ) : (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
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
          </div>

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