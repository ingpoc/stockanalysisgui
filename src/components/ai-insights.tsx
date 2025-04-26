"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingDown, TrendingUp, Info, History } from "lucide-react"
import { useStockData } from "@/hooks/useStockData" // Import the hook
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format } from 'date-fns'
import { AIAnalysis } from "@/lib/api"

interface AIInsightsProps {
  symbol: string
}

function AnalysisSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-end pt-4">
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function AIInsights({ symbol }: AIInsightsProps) {
  // Use the hook to get data and actions
  const {
    analysisContent,
    isLoadingAnalysis,
    errorAnalysis,
    analysisHistory,
    isLoadingHistory,
    errorHistory,
    refreshAnalysis,
    isRefreshingAnalysis,
  } = useStockData(symbol)

  // Loading state combines loading states from the hook
  const isLoading = isLoadingAnalysis || isLoadingHistory
  // Error state combines errors from the hook
  const error = errorAnalysis || errorHistory

  if (isLoading) {
    return <AnalysisSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading AI Insights</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }
  
  const handleRefresh = () => {
    refreshAnalysis() // Call the mutation from the hook
  }
  
  const renderAnalysisContent = (analysis: AIAnalysis | null | undefined) => {
      if (!analysis) {
        return <p>No current analysis available.</p>;
      }

      const SentimentIcon = analysis.sentiment.score >= 0.6 ? TrendingUp :
                           analysis.sentiment.score <= 0.4 ? TrendingDown : Info

      const sentimentColor = analysis.sentiment.score >= 0.6 ? 'text-green-500' :
                            analysis.sentiment.score <= 0.4 ? 'text-red-500' : 'text-yellow-500'
                            
      // Function to safely render analysis details which might be string or object
      const renderAnalysisDetail = (detail: any, title: string) => {
        if (!detail) return null;
        if (typeof detail === 'string') {
          return <p><strong className="font-medium">{title}:</strong> {detail}</p>;
        }
        if (Array.isArray(detail)) {
          return (
            <div>
              <strong className="font-medium">{title}:</strong>
              <ul className="list-disc list-inside ml-4">
                {detail.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          );
        }
        // Handle nested objects like risks_opportunities
        if (typeof detail === 'object') {
            return (
              <div>
                <strong className="font-medium">{title}:</strong>
                {Object.entries(detail).map(([key, value]) => (
                  <div key={key} className="ml-4 mt-1">
                    {renderAnalysisDetail(value, key.charAt(0).toUpperCase() + key.slice(1))} 
                  </div>
                ))}
              </div>
            );
        }
        return null;
      };

      return (
        <div className="space-y-4">
          <div className={`flex items-center gap-2 ${sentimentColor}`}>
            <SentimentIcon className="w-5 h-5" />
            <span className="font-semibold">Sentiment: {analysis.sentiment.label} (Score: {analysis.sentiment.score.toFixed(2)})</span>
          </div>
          
          {/* Render analysis based on its type */}
          {typeof analysis.analysis === 'string' ? (
            <p className="text-sm">{analysis.analysis}</p>
          ) : (
            <div className="space-y-2 text-sm">
              {renderAnalysisDetail(analysis.analysis.sentiment_summary, "Sentiment Summary")}
              {renderAnalysisDetail(analysis.analysis.key_factors, "Key Factors")}
              {renderAnalysisDetail(analysis.analysis.news_impact, "News Impact")}
              {renderAnalysisDetail(analysis.analysis.risks_opportunities, "Risks & Opportunities")}
              {renderAnalysisDetail(analysis.analysis.forward_outlook, "Forward Outlook")}
            </div>
          )}
          
          <p className="text-sm"><strong className="font-medium">Recommendation:</strong> {analysis.recommendation}</p>

          {/* Display Technical Indicators and Market Analysis if they exist and are objects */}
          {analysis.technical_indicators && typeof analysis.technical_indicators === 'object' && Object.keys(analysis.technical_indicators).length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="tech-indicators">
                <AccordionTrigger className="text-sm font-medium">Technical Indicators</AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(analysis.technical_indicators, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          
          {analysis.market_analysis && typeof analysis.market_analysis === 'object' && Object.keys(analysis.market_analysis).length > 0 && (
            <Accordion type="single" collapsible className="w-full">
               <AccordionItem value="market-analysis">
                <AccordionTrigger className="text-sm font-medium">Market Analysis</AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-1 text-xs">
                     {renderAnalysisDetail(analysis.market_analysis.sector_sentiment, "Sector Sentiment")}
                     {renderAnalysisDetail(analysis.market_analysis.peer_comparison, "Peer Comparison")}
                     {renderAnalysisDetail(analysis.market_analysis.institutional_interest, "Institutional Interest")}
                   </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          <p className="text-xs text-muted-foreground text-right">Generated: {format(new Date(analysis.timestamp), 'PPpp')}</p>
        </div>
      );
    };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>AI-powered analysis and sentiment</CardDescription>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshingAnalysis} size="sm" variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingAnalysis ? 'animate-spin' : ''}`} />
          {isRefreshingAnalysis ? 'Refreshing...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent>
         {renderAnalysisContent(analysisContent)}
         
         {/* Analysis History Section */}
         {analysisHistory && analysisHistory.analyses && analysisHistory.analyses.length > 0 && (
           <Accordion type="single" collapsible className="w-full mt-6 pt-4 border-t">
              <AccordionItem value="history">
                <AccordionTrigger>
                   <span className="flex items-center gap-2">
                     <History className="w-4 h-4" />
                     Analysis History ({analysisHistory.analyses.length})
                   </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {analysisHistory.analyses.map((item) => (
                       <li key={item.id} className="text-sm text-muted-foreground">
                         {format(new Date(item.timestamp), 'PPp')} - {item.label}
                         {/* Maybe add a button to load/view this specific analysis? */}
                       </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
         )}
      </CardContent>
    </Card>
  )
} 