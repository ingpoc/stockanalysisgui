'use client'

import { CandlestickChart } from 'lucide-react'

export default function TechnicalAnalysisPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="flex max-w-[32rem] flex-col items-center gap-4 text-center">
        <CandlestickChart className="h-16 w-16 text-blue-600 dark:text-blue-500" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Technical Analysis Coming Soon</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          Our advanced technical analysis tools are currently under development.
          You'll soon be able to access powerful chart patterns, indicators, and more!
        </p>
      </div>
    </div>
  )
} 