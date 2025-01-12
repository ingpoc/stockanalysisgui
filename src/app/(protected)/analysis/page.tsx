'use client'

import { BarChart3 } from 'lucide-react'

export default function StockAnalysisPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="flex max-w-[32rem] flex-col items-center gap-4 text-center">
        <BarChart3 className="h-16 w-16 text-blue-600 dark:text-blue-500" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Stock Analysis Coming Soon</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          Our comprehensive stock analysis tools are currently under development.
          You'll soon be able to analyze stocks with advanced metrics and indicators!
        </p>
      </div>
    </div>
  )
} 