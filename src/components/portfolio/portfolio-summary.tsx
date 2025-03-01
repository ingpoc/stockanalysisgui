'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HoldingWithCurrentPrice } from '@/types/portfolio'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface PortfolioSummaryProps {
  holdings: HoldingWithCurrentPrice[]
}

export function PortfolioSummaryComponent({ holdings }: PortfolioSummaryProps) {
  const totalInvestment = holdings.reduce(
    (sum, holding) => sum + holding.average_price * holding.quantity,
    0
  )

  const totalCurrentValue = holdings.reduce(
    (sum, holding) => sum + (holding.currentValue || holding.average_price * holding.quantity),
    0
  )

  const totalGainLoss = totalCurrentValue - totalInvestment
  const totalGainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0

  const topPerformers = [...holdings]
    .filter(h => (h.gainLossPercentage || 0) > 0)
    .sort((a, b) => (b.gainLossPercentage || 0) - (a.gainLossPercentage || 0))
    .slice(0, 3)

  const worstPerformers = [...holdings]
    .filter(h => (h.gainLossPercentage || 0) < 0)
    .sort((a, b) => (a.gainLossPercentage || 0) - (b.gainLossPercentage || 0))
    .slice(0, 3)

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Investment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
          <p className="text-xs text-muted-foreground">
            {holdings.length} stocks in portfolio
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Current Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</div>
          <p className="text-xs text-muted-foreground">
            Based on latest available prices
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Gain/Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {totalGainLoss > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : totalGainLoss < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            ) : null}
            <span
              className={`text-2xl font-bold ${
                totalGainLoss > 0
                  ? 'text-green-500'
                  : totalGainLoss < 0
                  ? 'text-red-500'
                  : ''
              }`}
            >
              {formatCurrency(totalGainLoss)}
            </span>
          </div>
          <p
            className={`text-xs ${
              totalGainLossPercentage > 0
                ? 'text-green-500'
                : totalGainLossPercentage < 0
                ? 'text-red-500'
                : 'text-muted-foreground'
            }`}
          >
            {formatPercentage(totalGainLossPercentage)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topPerformers.length > 0 && (
            <div>
              <p className="text-xs font-medium">Top Performers</p>
              <ul className="text-xs">
                {topPerformers.map(h => (
                  <li key={h.id || `top-${h.symbol}`} className="flex justify-between items-center">
                    <span>{h.symbol}</span>
                    <span className="text-green-500">
                      {formatPercentage(h.gainLossPercentage || 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {worstPerformers.length > 0 && (
            <div>
              <p className="text-xs font-medium mt-2">Worst Performers</p>
              <ul className="text-xs">
                {worstPerformers.map(h => (
                  <li key={h.id || `worst-${h.symbol}`} className="flex justify-between items-center">
                    <span>{h.symbol}</span>
                    <span className="text-red-500">
                      {formatPercentage(h.gainLossPercentage || 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 