'use client'

import { Brain } from 'lucide-react'

export default function AIInsightsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="flex max-w-[32rem] flex-col items-center gap-4 text-center">
        <Brain className="h-16 w-16 text-blue-600 dark:text-blue-500" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">AI Insights Coming Soon</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          Our AI-powered market analysis and prediction tools are in development.
          Soon you'll have access to advanced machine learning insights for better trading decisions!
        </p>
      </div>
    </div>
  )
} 