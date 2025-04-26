'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import { type StockDetailsResponse } from '@/lib/api'
import { useStockData } from '@/hooks/useStockData'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface CompanyInfoProps {
  symbol: string
}

function GrowthIndicator({ value }: { value: string | null | undefined }) {
  if (value === null || value === undefined || value === 'N/A' || value === '0%') {
      return <span className="text-sm text-muted-foreground">N/A</span>
  }
  const cleanValue = value.replace(/,/g, '').replace(/%%$/, '%')
  const numValue = parseFloat(cleanValue)
  const isPositive = numValue >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      isPositive 
        ? 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
        : 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      <Icon className="w-3 h-3" />
      {cleanValue}
    </span>
  )
}

function CompanyInfoSkeleton() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg bg-card p-4 shadow-sm border border-border animate-pulse">
            <Skeleton className="h-5 w-1/3 mb-3" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
}

export default function CompanyInfo({ symbol }: CompanyInfoProps) {
  const { 
    stockDetails, 
    isLoadingDetails, 
    errorDetails 
  } = useStockData(symbol)

  if (isLoadingDetails) {
    return <CompanyInfoSkeleton />
  }

  if (errorDetails) {
    return (
        <Alert variant="destructive" className="lg:col-span-3">
           <AlertTitle>Error Loading Company Info</AlertTitle>
           <AlertDescription>{errorDetails.message}</AlertDescription>
         </Alert>
    )
  }

  if (!stockDetails || !stockDetails.stock.financial_metrics || stockDetails.stock.financial_metrics.length === 0) {
    return (
      <Alert variant="default" className="lg:col-span-3">
        <AlertTitle>No Financial Data</AlertTitle>
        <AlertDescription>Financial metric details are currently unavailable for this stock.</AlertDescription>
      </Alert>
    )
  }
  
  const metrics = stockDetails.stock.financial_metrics[0]
  const formatted_metrics = stockDetails.formatted_metrics

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Basic Information */}
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-3">Basic Information</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">CMP</dt>
            <dd className="mt-1 text-lg font-semibold text-card-foreground">
              {formatted_metrics.cmp}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Report Type</dt>
            <dd className="mt-1 text-sm text-card-foreground">{metrics.report_type || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Result Date</dt>
            <dd className="mt-1 text-sm text-card-foreground">{formatted_metrics.result_date || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Quarter</dt>
            <dd className="mt-1 text-sm text-card-foreground">{metrics.quarter || 'N/A'}</dd>
          </div>
        </dl>
      </div>

      {/* Insights */}
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-3">Insights</h2>
        <div className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Strengths</dt>
            <dd className="mt-1 text-sm font-medium text-green-700 dark:text-green-400 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-800/50">
              {formatted_metrics.strengths || 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Weaknesses</dt>
            <dd className="mt-1 text-sm font-medium text-red-700 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800/50">
              {formatted_metrics.weaknesses || 'N/A'}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Technicals</dt>
              <dd className="mt-1 text-sm text-card-foreground">
                {metrics.technicals_trend || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Piotroski Score</dt>
              <dd className="mt-1 text-sm text-card-foreground">
                {metrics.piotroski_score || 'N/A'}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-3">Growth Metrics (3Y CAGR)</h2>
        <dl className="space-y-3">
          <div className="flex justify-between items-center">
            <dt className="text-sm font-medium text-muted-foreground">Revenue Growth</dt>
            <dd><GrowthIndicator value={metrics.revenue_growth_3yr_cagr} /></dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-sm font-medium text-muted-foreground">Net Profit Growth</dt>
            <dd><GrowthIndicator value={metrics.net_profit_growth_3yr_cagr} /></dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-sm font-medium text-muted-foreground">Operating Profit Growth</dt>
            <dd><GrowthIndicator value={metrics.operating_profit_growth_3yr_cagr} /></dd>
          </div>
        </dl>
      </div>

      {/* Valuation Metrics */}
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-3">Valuation Metrics</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Market Cap (Cr)</dt>
            <dd className="mt-1 text-sm text-card-foreground">₹{metrics.market_cap || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">TTM P/E</dt>
            <dd className="mt-1 text-sm text-card-foreground">{metrics.ttm_pe || 'N/A'}</dd>
          </div>
           <div>
            <dt className="text-sm font-medium text-muted-foreground">Sector P/E</dt>
            <dd className="mt-1 text-sm text-card-foreground">{metrics.sector_pe || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">P/B Ratio</dt>
            <dd className="mt-1 text-sm text-card-foreground">{metrics.pb_ratio || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Dividend Yield</dt>
            <dd className="mt-1 text-sm text-card-foreground">{metrics.dividend_yield || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Book Value</dt>
            <dd className="mt-1 text-sm text-card-foreground">₹{metrics.book_value || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Face Value</dt>
            <dd className="mt-1 text-sm text-card-foreground">₹{metrics.face_value || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">TTM EPS</dt>
            <dd className="mt-1 text-sm text-card-foreground">₹{metrics.ttm_eps || 'N/A'}</dd>
          </div>
        </dl>
      </div>

      {/* Financial Performance */}
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-3">Financial Performance ({metrics.quarter})</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Revenue (Cr)</dt>
            <dd className="mt-1 text-sm text-card-foreground">₹{metrics.revenue || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Revenue Growth</dt>
            <dd><GrowthIndicator value={metrics.revenue_growth} /></dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Gross Profit (Cr)</dt>
            <dd className="mt-1 text-sm text-card-foreground">₹{metrics.gross_profit || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Gross Profit Growth</dt>
            <dd><GrowthIndicator value={metrics.gross_profit_growth} /></dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Net Profit (Cr)</dt>
            <dd className="mt-1 text-sm text-card-foreground">₹{metrics.net_profit || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Net Profit Growth</dt>
            <dd><GrowthIndicator value={formatted_metrics.net_profit_growth} /></dd>
          </div>
        </dl>
      </div>

      {/* Recommendation Card */}
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border lg:col-span-3">
        <h2 className="text-lg font-semibold text-card-foreground mb-3">Fundamental Insights</h2>
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-start gap-4">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {formatted_metrics.recommendation || 'No specific recommendation'}
              </p>
              {metrics.fundamental_insights_description && (
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  {metrics.fundamental_insights_description}
                </p>
              )}
              {!metrics.fundamental_insights_description && formatted_metrics.recommendation && (
                 <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  General insights based on available metrics.
                </p>
              )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 