'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StockRecommendation } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Clock, Target, RefreshCw, ChevronRight } from 'lucide-react'

interface StockRecommendationProps {
  recommendation: StockRecommendation
  currentPrice?: number
}

export function StockRecommendationDisplay({ recommendation, currentPrice }: StockRecommendationProps) {
  const [open, setOpen] = useState(false)

  const getActionColor = () => {
    switch (recommendation.action) {
      case 'BUY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'SELL':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
  }

  const getActionIcon = () => {
    switch (recommendation.action) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4 mr-1" />
      case 'SELL':
        return <TrendingDown className="h-4 w-4 mr-1" />
      default:
        return <Minus className="h-4 w-4 mr-1" />
    }
  }

  const getTimeframeLabel = () => {
    switch (recommendation.timeframe) {
      case 'short':
        return 'Short-term'
      case 'long':
        return 'Long-term'
      default:
        return 'Medium-term'
    }
  }
  
  const getConfidenceColor = () => {
    if (recommendation.confidence >= 70) return 'text-green-600 dark:text-green-400'
    if (recommendation.confidence >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className={getActionColor()}>
          <div className="flex items-center">
            {getActionIcon()}
            {recommendation.action}
          </div>
        </Badge>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getActionColor()}>{recommendation.action}</Badge>
                  <span>{recommendation.symbol}</span>
                </div>
              </DialogTitle>
              <DialogDescription>
                <div className="mt-2 flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{getTimeframeLabel()} recommendation</span>
                  <Badge variant="outline" className="ml-2">
                    Confidence: {recommendation.confidence}%
                  </Badge>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {currentPrice && (
                <div className="flex space-x-4">
                  <div>
                    <p className="text-sm font-medium">Current Price</p>
                    <p className="text-lg">{formatCurrency(currentPrice)}</p>
                  </div>
                  {recommendation.target_price && (
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <Target className="h-4 w-4 mr-1 text-green-500" />
                        Target Price
                      </p>
                      <p className="text-lg text-green-600">{formatCurrency(recommendation.target_price)}</p>
                    </div>
                  )}
                  {recommendation.stop_loss && (
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <RefreshCw className="h-4 w-4 mr-1 text-red-500" />
                        Stop Loss
                      </p>
                      <p className="text-lg text-red-600">{formatCurrency(recommendation.stop_loss)}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium mb-2">Reasoning</p>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  {recommendation.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mt-4">
                  Recommendation generated on{' '}
                  {new Date(recommendation.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
