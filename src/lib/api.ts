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

export async function getStockDetails(symbol: string): Promise<Stock> {
  try {
    const response = await fetch(`${API_BASE_URL}/stock/${symbol}`)
    if (!response.ok) {
      throw new Error('Failed to fetch stock details')
    }
    const data = await response.json()
    return data.stock
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