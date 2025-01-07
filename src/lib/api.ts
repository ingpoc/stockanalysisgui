const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface Stock {
  company_name: string
  symbol: string
  cmp: string
  net_profit_growth: string
  strengths: string
  weaknesses: string
  piotroski_score: string
  estimates: string
  result_date: string
  recommendation: string
}

export interface MarketOverview {
  quarter: string
  top_performers: Stock[]
  worst_performers: Stock[]
  latest_results: Stock[]
  all_stocks: Stock[]
}

export interface FinancialMetric {
  market_cap: string
  face_value: string
  book_value: string
  dividend_yield: string
  ttm_eps: string
  ttm_pe: string
  pb_ratio: string
  sector_pe: string
  piotroski_score: string
  revenue_growth_3yr_cagr: string
  net_profit_growth_3yr_cagr: string
  operating_profit_growth_3yr_cagr: string
  strengths: string
  weaknesses: string
  technicals_trend: string
  fundamental_insights: string
  fundamental_insights_description: string
  revenue: string
  gross_profit: string
  net_profit: string
  net_profit_growth: string
  result_date: string
  gross_profit_growth: string
  revenue_growth: string
  quarter: string
  report_type: string
  cmp: string
  estimates: string
}

export interface FormattedMetrics {
  company_name: string
  symbol: string
  cmp: string
  net_profit_growth: string
  strengths: string
  weaknesses: string
  piotroski_score: string
  estimates: string
  result_date: string
  recommendation: string
}

export interface StockDetailsResponse {
  stock: {
    company_name: string
    symbol: string
    financial_metrics: FinancialMetric[]
    timestamp: string
  }
  formatted_metrics: FormattedMetrics
}

export interface AnalysisSentiment {
  score: number
  label: string
}

export interface AIAnalysis {
  id: string;
  company_name: string;
  symbol: string;
  analysis: string | {
    sentiment_summary: string;
    key_factors: string[];
    news_impact: string[];
    risks_opportunities: {
      risks: string[];
      opportunities: string[];
    };
    forward_outlook: string;
  };
  sentiment: {
    score: number;
    label: string;
  };
  technical_indicators: Record<string, any>;
  market_analysis: {
    sector_sentiment: string;
    peer_comparison: string;
    institutional_interest: string;
  };
  recommendation: string;
  timestamp: string;
}

export interface AIAnalysisHistory {
  analyses: {
    id: string
    timestamp: string
    label: string
  }[]
}

export async function fetchMarketData(quarter?: string): Promise<MarketOverview> {
  try {
    const url = new URL(`${API_BASE_URL}/market-data`)
    if (quarter) {
      url.searchParams.append('quarter', quarter)
    }
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error('Failed to fetch market data')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching market data:', error)
    throw error
  }
}

export async function refreshStockAnalysis(symbol: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/stock/${symbol}/refresh-analysis`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to refresh analysis')
    }
  } catch (error) {
    console.error('Error refreshing analysis:', error)
    throw error
  }
}

export async function getStockDetails(symbol: string): Promise<StockDetailsResponse> {
  try {
    const url = `${API_BASE_URL}/stock/${symbol}`
    console.log('Fetching from URL:', url)
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText
      })
      throw new Error('Failed to fetch stock details')
    }
    
    const data = await response.json()
    console.log('API Success:', data)
    return data
  } catch (error) {
    console.error('Error fetching stock details:', error)
    throw error
  }
}

export async function getQuarters(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/quarters`, { signal })
  if (!response.ok) {
    throw new Error('Failed to fetch quarters')
  }
  const data = await response.json()
  return data.quarters || []
}

export async function searchStocks(query: string, quarter?: string): Promise<Stock[]> {
  try {
    // Get all stocks from market data for the current quarter
    const data = await fetchMarketData(quarter)
    const allStocks = data?.all_stocks || []
    
    // Filter stocks based on query (case-insensitive)
    const searchQuery = query.toLowerCase()
    return allStocks.filter(stock => 
      (stock.company_name?.toLowerCase().includes(searchQuery) || 
       stock.symbol?.toLowerCase().includes(searchQuery)) ?? false
    )
  } catch (error) {
    console.error('Error searching stocks:', error)
    return [] // Return empty array instead of throwing
  }
}

export async function fetchStockChart(symbol: string, interval: string = "1y"): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/stock/${symbol}/chart?interval=${interval}`)
  if (!response.ok) {
    throw new Error('Failed to fetch chart data')
  }
  return response.json()
}

export async function getStockAnalysisHistory(symbol: string): Promise<AIAnalysisHistory> {
  const response = await fetch(`${API_BASE_URL}/stock/${symbol}/analysis-history`)
  if (!response.ok) {
    throw new Error('Failed to fetch analysis history')
  }
  return response.json()
}

export async function getAnalysisContent(analysisId: string, retryCount = 3, retryDelay = 1000): Promise<AIAnalysis> {
  let lastError;
  
  for (let i = 0; i < retryCount; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch analysis content: ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
      lastError = error
      if (i < retryCount - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  throw lastError || new Error('Failed to fetch analysis content after retries')
}

export async function refreshAnalysis(symbol: string): Promise<{
  id: string
  content: string
  timestamp: string
  recommendation: string
}> {
  const response = await fetch(`${API_BASE_URL}/stock/${symbol}/refresh-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to refresh analysis: ${errorText}`)
  }
  
  return response.json()
} 