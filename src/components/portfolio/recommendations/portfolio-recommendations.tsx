'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { TrendingUp, TrendingDown, Minus, AlertCircle, RefreshCw } from 'lucide-react'
import { PortfolioRecommendations, getPortfolioRecommendations } from '@/lib/api'

export function PortfolioRecommendationsComponent() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<PortfolioRecommendations | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadRecommendations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const recommendations = await getPortfolioRecommendations()
      setData(recommendations)
    } catch (err) {
      console.error('Error loading recommendations:', err)
      setError('Failed to load portfolio recommendations')
      toast.error('Failed to load recommendations', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Recommendations</CardTitle>
          <CardDescription>Loading recommendations...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Recommendations</CardTitle>
          <CardDescription>Recommendations for your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || 'Failed to load recommendations'}
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={loadRecommendations} 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Count recommendations by type
  const { buy, sell, hold, total } = data.summary.recommendation_counts

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Portfolio Recommendations</CardTitle>
            <CardDescription>
              Analysis based on current holdings and market data
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadRecommendations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                  <span className="font-medium">Buy</span>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {buy} stocks
                </Badge>
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">
                  {(buy / total * 100).toFixed(0)}% of portfolio
                </div>
                <div className="w-full h-2 bg-green-100 dark:bg-green-900 rounded-full mt-1">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${(buy / total * 100).toFixed(0)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Minus className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="font-medium">Hold</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {hold} stocks
                </Badge>
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">
                  {(hold / total * 100).toFixed(0)}% of portfolio
                </div>
                <div className="w-full h-2 bg-blue-100 dark:bg-blue-900 rounded-full mt-1">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(hold / total * 100).toFixed(0)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                  <span className="font-medium">Sell</span>
                </div>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  {sell} stocks
                </Badge>
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">
                  {(sell / total * 100).toFixed(0)}% of portfolio
                </div>
                <div className="w-full h-2 bg-red-100 dark:bg-red-900 rounded-full mt-1">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${(sell / total * 100).toFixed(0)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="suggestions">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="suggestions">Portfolio Suggestions</TabsTrigger>
            <TabsTrigger value="top-picks">Top Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="space-y-4">
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Portfolio Suggestions</h3>
              <ul className="space-y-2">
                {data.summary.portfolio_suggestions.length > 0 ? (
                  data.summary.portfolio_suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 mt-1 text-amber-500" />
                      <span>{suggestion}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No suggestions available</li>
                )}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="top-picks" className="space-y-4">
            <div className="mt-4 space-y-4">
              {data.summary.top_buy_recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    Top Buy Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {data.summary.top_buy_recommendations.map((rec, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="font-medium">{rec.symbol}</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {rec.confidence}% confidence
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.summary.top_sell_recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium flex items-center mb-2">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                    Top Sell Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {data.summary.top_sell_recommendations.map((rec, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="font-medium">{rec.symbol}</span>
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          {rec.confidence}% confidence
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.summary.top_buy_recommendations.length === 0 && 
               data.summary.top_sell_recommendations.length === 0 && (
                <p className="text-muted-foreground">No top recommendations available</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
