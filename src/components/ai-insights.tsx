"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingDown, TrendingUp, Info } from 'lucide-react'
import { toast } from 'sonner'
import { getAnalysisContent, refreshAnalysis, getStockAnalysisHistory, type AIAnalysis } from '@/lib/api'

interface AIInsightsProps {
  symbol: string
}

export function AIInsights({ symbol }: AIInsightsProps) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)

  const fetchLatestAnalysis = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        const refreshResult = await refreshAnalysis(symbol)
        await new Promise(resolve => setTimeout(resolve, 500))
        return await getAnalysisContent(refreshResult.id)
      }

      // Try to get existing analysis first
      const history = await getStockAnalysisHistory(symbol)
      if (history.analyses.length > 0) {
        const latestAnalysis = history.analyses[0]
        return await getAnalysisContent(latestAnalysis.id)
      }

      // If no analysis exists, generate a new one
      const refreshResult = await refreshAnalysis(symbol)
      await new Promise(resolve => setTimeout(resolve, 500))
      return await getAnalysisContent(refreshResult.id)
    } catch (err) {
      console.error('Error fetching analysis:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch analysis')
    }
  }, [symbol])

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const fetchAnalysis = async () => {
      if (!mounted) return

      setLoading(true)
      setError(null)
      try {
        const newAnalysis = await fetchLatestAnalysis(false)
        if (mounted) {
          setAnalysis(newAnalysis)
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analysis'
          setError(errorMessage)
          console.error('Error in fetchAnalysis:', err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (symbol) {
      timeoutId = setTimeout(fetchAnalysis, 100)
    }

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [symbol, fetchLatestAnalysis])

  const handleRefresh = useCallback(async () => {
    if (refreshing) return // Prevent duplicate calls while refreshing

    setRefreshing(true)
    try {
      await toast.promise(
        async () => {
          const newAnalysis = await fetchLatestAnalysis(true)
          setAnalysis(newAnalysis)
        },
        {
          loading: 'Generating new analysis...',
          success: 'Analysis updated successfully',
          error: (err) => `Failed to generate analysis: ${err.message}`,
        }
      )
    } catch (err) {
      console.error('Failed to refresh analysis:', err)
    } finally {
      setRefreshing(false)
    }
  }, [refreshing, fetchLatestAnalysis])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>Loading analysis...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>No analysis available</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Generate Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  const SentimentIcon = analysis.sentiment.score >= 0.6 ? TrendingUp :
                       analysis.sentiment.score <= 0.4 ? TrendingDown : Info

  const sentimentColor = analysis.sentiment.score >= 0.6 ? 'text-green-500' :
                        analysis.sentiment.score <= 0.4 ? 'text-red-500' : 'text-yellow-500'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SentimentIcon className={`h-5 w-5 ${sentimentColor}`} />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Last updated:</span>{' '}
              {new Date(analysis.timestamp).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}{' '}
              {new Date(analysis.timestamp).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        <CardDescription>
          Analysis confidence: {(analysis.sentiment.score * 100).toFixed(1)}% - {analysis.sentiment.label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Analysis */}
          <div className="space-y-4">
            {typeof analysis.analysis === 'string' ? (
              // Old format
              <div>
                <h3 className="text-lg font-semibold mb-2">Analysis</h3>
                <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300">
                  {analysis.analysis.split('**').map((section, index) => {
                    if (index % 2 === 1) { // Section title
                      return <h4 key={index} className="font-medium mt-4 mb-2">{section.trim()}</h4>;
                    } else { // Section content
                      return <p key={index} className="mb-4">{section.trim()}</p>;
                    }
                  })}
                </div>
              </div>
            ) : (
              // New format
              <>
                {/* Sentiment Summary */}
                {analysis.analysis.sentiment_summary && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Market Sentiment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {analysis.analysis.sentiment_summary}
                    </p>
                  </div>
                )}

                {/* Key Factors */}
                {analysis.analysis.key_factors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Key Market Factors</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysis.analysis.key_factors.map((factor, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {factor.replace(/^[:\s-]+|[:\s-]+$/g, '').trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* News Impact */}
                {analysis.analysis.news_impact.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Latest News Impact</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysis.analysis.news_impact.map((news, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {news.replace(/^[:\s-]+|[:\s-]+$/g, '').trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risks and Opportunities */}
                {analysis.analysis.risks_opportunities && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Hidden Risks & Opportunities</h3>
                    {analysis.analysis.risks_opportunities.risks.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-md font-medium mb-2 text-red-600 dark:text-red-400">Risks</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {analysis.analysis.risks_opportunities.risks.map((risk, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                              {risk.replace(/^[:\s-]+|[:\s-]+$/g, '').trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.analysis.risks_opportunities.opportunities.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium mb-2 text-green-600 dark:text-green-400">Opportunities</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {analysis.analysis.risks_opportunities.opportunities.map((opportunity, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                              {opportunity.replace(/^[:\s-]+|[:\s-]+$/g, '').trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Forward Outlook */}
                {analysis.analysis.forward_outlook && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Forward Outlook & Catalysts</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {analysis.analysis.forward_outlook.replace(/^[:\s-]+|[:\s-]+$/g, '').trim()}
                    </p>
                  </div>
                )}

                {/* Market Analysis */}
                {analysis.market_analysis && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Market Context</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(analysis.market_analysis).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </dt>
                          <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white capitalize">{value}</dd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Recommendation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Recommendation</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">{analysis.recommendation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 