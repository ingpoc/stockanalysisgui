import { MarketOverview, ScrapingStatus } from "../types/market";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchMarketData(quarter?: string, forceRefresh: boolean = false): Promise<MarketOverview> {
  try {
    const url = new URL(`${API_BASE_URL}/market-data`);
    if (quarter) {
      url.searchParams.append('quarter', quarter);
    }
    if (forceRefresh) {
      url.searchParams.append('force_refresh', 'true');
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}

export async function refreshStockAnalysis(symbol: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/stock/${symbol}/refresh-analysis`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to refresh analysis');
    }
  } catch (error) {
    console.error('Error refreshing analysis:', error);
    throw error;
  }
}

export async function getQuarters(forceRefresh: boolean = false, signal?: AbortSignal): Promise<string[]> {
  try {
    const url = new URL(`${API_BASE_URL}/quarters`);
    if (forceRefresh) {
      url.searchParams.append('force_refresh', 'true');
    }
    const response = await fetch(url.toString(), { signal });
    if (!response.ok) {
      throw new Error('Failed to fetch quarters');
    }
    const data = await response.json();
    // Backend returns an object { quarters: [...] }
    if (Array.isArray(data)) {
      return data as string[];
    }
    if (data && Array.isArray(data.quarters)) {
      return data.quarters as string[];
    }
    // Fallback: return empty array if structure unexpected
    console.warn('Unexpected quarters response format:', data);
    return [];
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Silently handle aborts
      return [];
    }
    console.error('Error fetching quarters:', error);
    throw error;
  }
}

export async function checkScrapingStatus(): Promise<ScrapingStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/scraper/status`);
    if (!response.ok) {
      throw new Error('Failed to check scraping status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking scraping status:', error);
    throw error;
  }
}

export async function triggerScraper(resultType: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/scraper/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ result_type: resultType }),
    });
    if (!response.ok) {
      throw new Error('Failed to trigger scraper');
    }
  } catch (error) {
    console.error('Error triggering scraper:', error);
    throw error;
  }
} 