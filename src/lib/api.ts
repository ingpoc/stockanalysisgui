import { Holding, HoldingWithCurrentPrice } from '@/types/portfolio'

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
    console.log(`Fetching stock details for ${symbol} from ${API_BASE_URL}/stock/${symbol}`)
    const response = await fetch(`${API_BASE_URL}/stock/${symbol}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error fetching stock details: ${response.status} - ${errorText}`)
      
      // Check if the error is a "not found" error
      const notFoundPattern = /Stock with symbol .* not found/i
      if (response.status === 500 && notFoundPattern.test(errorText)) {
        throw new Error(`Stock symbol "${symbol}" not found in the database. Please check the symbol and try again.`)
      }
      
      // Throw a more specific error with status code
      throw new Error(`Failed to fetch stock details: ${response.status} ${response.statusText}. Ensure the symbol exists in the database.`)
    }
    
    const data = await response.json()
    
    // Format currency values to show INR
    if (data.formatted_metrics && data.formatted_metrics.cmp) {
      // Add INR prefix if it doesn't already have currency symbol
      if (!data.formatted_metrics.cmp.includes('₹')) {
        data.formatted_metrics.cmp = `₹${data.formatted_metrics.cmp}`
      }
    }
    
    console.log('Stock details data:', data)
    return data
  } catch (error) {
    console.error('Error fetching stock details:', error)
    // Rethrow the error with additional context
    throw error instanceof Error 
      ? error 
      : new Error(`Unknown error fetching stock details for ${symbol}`)
  }
}

export async function getBatchStockDetails(symbols: string[]): Promise<Record<string, StockDetailsResponse>> {
  try {
    console.log(`Fetching batch stock details for ${symbols.length} symbols`)
    
    const response = await fetch(`${API_BASE_URL}/stock/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(symbols),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error fetching batch stock details: ${response.status} - ${errorText}`)
      throw new Error(`Failed to fetch batch stock details: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Format currency values to show INR for all stocks
    for (const symbol in data) {
      if (data[symbol] && data[symbol].formatted_metrics && data[symbol].formatted_metrics.cmp) {
        // Add INR prefix if it doesn't already have currency symbol
        if (!data[symbol].formatted_metrics.cmp.includes('₹')) {
          data[symbol].formatted_metrics.cmp = `₹${data[symbol].formatted_metrics.cmp}`
        }
      }
    }
    
    return data
  } catch (error) {
    console.error('Error fetching batch stock details:', error)
    throw error instanceof Error
      ? error
      : new Error('Unknown error fetching batch stock details')
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

// Portfolio API functions

export async function fetchHoldings(): Promise<Holding[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/holdings`)
    if (!response.ok) {
      throw new Error('Failed to fetch holdings')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching holdings:', error)
    throw error
  }
}

export async function fetchEnrichedHoldings(): Promise<HoldingWithCurrentPrice[]> {
  try {
    console.log('Fetching enriched holdings from backend...')
    const response = await fetch(`${API_BASE_URL}/portfolio/holdings/enriched`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error fetching enriched holdings: ${response.status} - ${errorText}`)
      throw new Error('Failed to fetch enriched holdings')
    }
    
    const data = await response.json()
    
    // Convert snake_case properties from backend to camelCase for frontend
    return data.map((holding: any) => {
      return {
        id: holding.id,
        symbol: holding.symbol,
        company_name: holding.company_name,
        quantity: holding.quantity,
        average_price: holding.average_price,
        purchase_date: holding.purchase_date,
        notes: holding.notes,
        timestamp: holding.timestamp,
        currentPrice: holding.current_price || 0,
        currentValue: holding.current_value || 0,
        gainLoss: holding.gain_loss || 0,
        gainLossPercentage: holding.gain_loss_percentage || 0,
        hasError: holding.has_error || false,
        errorMessage: holding.error_message || ''
      }
    })
  } catch (error) {
    console.error('Error fetching enriched holdings:', error)
    throw error
  }
}

export async function addHolding(holding: Holding): Promise<Holding> {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/holdings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holding),
    })
    if (!response.ok) {
      throw new Error(`Error adding holding: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error adding holding:', error)
    throw error
  }
}

export async function updateHolding(id: string, holding: Holding): Promise<Holding> {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/holdings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holding),
    })
    if (!response.ok) {
      throw new Error(`Error updating holding: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error updating holding:', error)
    throw error
  }
}

export async function deleteHolding(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/holdings/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`Error deleting holding: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting holding:', error)
    throw error
  }
}

export async function clearHoldings(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/holdings`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`Error clearing holdings: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error clearing holdings:', error)
    throw error
  }
}

export async function importHoldingsFromCSV(file: File): Promise<Holding[]> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/portfolio/holdings/import`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error importing holdings: ${response.status} - ${errorText}`)
      
      // Provide more specific error messages based on status code
      if (response.status === 400) {
        throw new Error(`CSV format error: ${errorText || 'Invalid CSV format'}`)
      } else if (response.status === 413) {
        throw new Error('File too large. Please upload a smaller CSV file.')
      } else {
        throw new Error(`Error importing holdings: ${response.status} ${response.statusText}`)
      }
    }
    
    const data = await response.json()
    console.log('Successfully imported holdings:', data.length)
    return data
  } catch (error) {
    console.error('Error importing holdings:', error)
    // Rethrow with more context if it's not already an Error object
    throw error instanceof Error 
      ? error 
      : new Error('Failed to import holdings from CSV')
  }
} 