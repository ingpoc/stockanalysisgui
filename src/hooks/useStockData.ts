'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getStockDetails, 
  fetchStockChart, 
  getAnalysisContent, 
  refreshAnalysis, 
  getStockAnalysisHistory,
  StockDetailsResponse,
  AIAnalysis,
  AIAnalysisHistory,
} from '@/lib/api'
import { toast } from 'sonner'

interface ChartDataPoint {
  date: string
  close: number
}

export function useStockData(symbol: string) {
  const queryClient = useQueryClient()

  // Query for stock details
  const { 
    data: stockDetails, 
    isLoading: isLoadingDetails, 
    error: errorDetails 
  } = useQuery<StockDetailsResponse, Error>({
    queryKey: ['stockDetails', symbol],
    queryFn: () => getStockDetails(symbol),
    enabled: !!symbol, // Only run query if symbol is available
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Query for stock chart data
  const { 
    data: chartData, 
    isLoading: isLoadingChart, 
    error: errorChart 
  } = useQuery<ChartDataPoint[], Error>({
    queryKey: ['stockChart', symbol], // Add interval if needed later
    queryFn: () => fetchStockChart(symbol), // Add interval parameter if needed
    enabled: !!symbol,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })

  // Query for AI analysis history
  const { 
    data: analysisHistory,
    isLoading: isLoadingHistory, 
    error: errorHistory 
  } = useQuery<AIAnalysisHistory, Error>({
    queryKey: ['analysisHistory', symbol],
    queryFn: () => getStockAnalysisHistory(symbol),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Determine the latest analysis ID from history
  const latestAnalysisId = analysisHistory?.analyses?.[0]?.id;

  // Query for AI analysis content
  const { 
    data: analysisContent, 
    isLoading: isLoadingAnalysis, 
    error: errorAnalysis 
  } = useQuery<AIAnalysis | null, Error>({
    queryKey: ['analysisContent', latestAnalysisId], // Use latestAnalysisId in the key
    queryFn: async () => {
      if (!latestAnalysisId) {
        console.log("No analysis history found, skipping content fetch.");
        return null; // Return null if no history/ID
      }
      console.log(`Fetching analysis content for ID: ${latestAnalysisId}`);
      return getAnalysisContent(latestAnalysisId); // Fetch content using the ID
    },
    enabled: !!latestAnalysisId, // Only run if we have an ID from history
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mutation for refreshing AI analysis
  const refreshAnalysisMutation = useMutation<{ id: string; content: string; timestamp: string; recommendation: string; }, Error>({
    mutationFn: () => refreshAnalysis(symbol),
    onSuccess: (data) => {
      toast.success(`AI Analysis refresh initiated (ID: ${data.id})`)

      // Explicitly refetch history first, then refetch content.
      queryClient.refetchQueries({ queryKey: ['analysisHistory', symbol], exact: true })
        .then(() => {
          // History is refetched, now latestAnalysisId should be updated internally.
          // Refetch the content query. React Query will use the latest `latestAnalysisId`
          // when evaluating the query key during the refetch.
          console.log('Refetching content after history update...')
          queryClient.refetchQueries({ queryKey: ['analysisContent'], type: 'active' })
        })
        .catch((error) => {
            console.error("Error refetching history/content:", error);
            toast.error("Failed to update analysis display.");
        });
    },
    onError: (error) => {
      toast.error('Failed to refresh AI Analysis', { description: error.message })
    }
  })

  return {
    stockDetails,
    isLoadingDetails,
    errorDetails,
    
    chartData,
    isLoadingChart,
    errorChart,

    analysisContent,
    isLoadingAnalysis,
    errorAnalysis,
    
    analysisHistory,
    isLoadingHistory,
    errorHistory,

    refreshAnalysis: refreshAnalysisMutation.mutate,
    isRefreshingAnalysis: refreshAnalysisMutation.isPending,
  }
} 