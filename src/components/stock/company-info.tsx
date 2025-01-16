'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import { getStockDetails, type StockDetailsResponse } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

function GrowthIndicator({ value }: { value: string }) {
  const cleanValue = value?.replace(/,/g, '').replace(/%%$/, '%')
  const numValue = parseFloat(cleanValue)
  const isPositive = numValue >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
      isPositive 
        ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' 
        : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
    }`}>
      <Icon className="w-3 h-3" />
      {cleanValue}
    </span>
  )
}

interface CompanyInfoProps {
  symbol: string
}

export default function CompanyInfo({ symbol }: CompanyInfoProps) {
  const [stockDetails, setStockDetails] = useState<StockDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStockDetails() {
      try {
        const data = await getStockDetails(symbol)
        setStockDetails(data)
      } catch (error) {
        console.error('Failed to fetch stock details:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStockDetails()
  }, [symbol])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!stockDetails) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 dark:text-gray-400">Failed to load company information</p>
      </div>
    )
  }

  const { stock, formatted_metrics } = stockDetails
  const metrics = stock.financial_metrics[0] || {}

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Basic Information */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CMP</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              ₹{formatted_metrics.cmp}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Report Type</dt>
            <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">{metrics.report_type}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Result Date</dt>
            <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">{formatted_metrics.result_date || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quarter</dt>
            <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">{metrics.quarter || 'N/A'}</dd>
          </div>
        </dl>
      </div>

      {/* Insights */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Insights</h2>
        <div className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Strengths</dt>
            <dd className="mt-1 text-base font-medium text-green-600 dark:text-green-400 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              {formatted_metrics.strengths || 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Weaknesses</dt>
            <dd className="mt-1 text-base font-medium text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
              {formatted_metrics.weaknesses || 'N/A'}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Technicals</dt>
              <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                {metrics.technicals_trend || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Piotroski Score</dt>
              <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                {metrics.piotroski_score || 'N/A'}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Growth Metrics</h2>
        <dl className="grid grid-cols-1 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Growth (3Y CAGR)</dt>
            <dd className="mt-1">
              <GrowthIndicator value={metrics.revenue_growth_3yr_cagr || '0%'} />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit Growth (3Y CAGR)</dt>
            <dd className="mt-1">
              <GrowthIndicator value={metrics.net_profit_growth_3yr_cagr || '0%'} />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Operating Profit Growth (3Y CAGR)</dt>
            <dd className="mt-1">
              <GrowthIndicator value={metrics.operating_profit_growth_3yr_cagr || '0%'} />
            </dd>
          </div>
        </dl>
      </div>

      {/* Recommendation Card */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendation</h2>
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {formatted_metrics.recommendation || 'No recommendation available'}
              </p>
              {metrics.fundamental_insights_description && (
                <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                  {metrics.fundamental_insights_description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 