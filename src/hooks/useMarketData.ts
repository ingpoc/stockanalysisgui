import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { fetchMarketData, getQuarters } from '@/services/marketDataService';
import { MarketOverview, StockCategory } from '@/types/market';

interface UseMarketDataReturn {
  marketData: MarketOverview | null;
  loading: boolean;
  selectedQuarter: string;
  setSelectedQuarter: (quarter: string) => void;
  availableQuarters: string[];
  fetchErrors: number;
  lastDataFetchTime: number;
  loadMarketData: (quarter: string, forceRefresh?: boolean) => Promise<void>;
  activeCategory: StockCategory;
  setActiveCategory: (category: StockCategory) => void;
}

export function useMarketData(): UseMarketDataReturn {
  const searchParams = useSearchParams();
  
  // Read initial category and quarter from URL parameters
  const categoryParam = searchParams.get('category') as StockCategory | null;
  const quarterParam = searchParams.get('quarter');
  
  // State variables
  const [marketData, setMarketData] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [availableQuarters, setAvailableQuarters] = useState<string[]>([]);
  const [fetchErrors, setFetchErrors] = useState<number>(0);
  const [lastDataFetchTime, setLastDataFetchTime] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<StockCategory>(
    categoryParam && ['top-performers', 'worst-performers', 'latest-results', 'all-stocks'].includes(categoryParam) 
    ? categoryParam 
    : 'top-performers'
  );

  // Refs for tracking internal state without causing re-renders
  const isFetchingRef = useRef(false);
  const lastQuarterFetchedRef = useRef<string | null>(null);

  // Function to load market data
  const loadMarketData = useCallback(async (quarter: string, forceRefresh: boolean = false) => {
    if (isFetchingRef.current && lastQuarterFetchedRef.current === quarter && !forceRefresh) {
      console.log(`Already fetching data for ${quarter}, skipping duplicate request`);
      return;
    }
    if (!quarter) return;

    isFetchingRef.current = true;
    lastQuarterFetchedRef.current = quarter;
    setLoading(true);

    try {
      console.log(`Fetching market data for quarter: ${quarter}${forceRefresh ? ' (forced refresh)' : ''}`);
      const data = await fetchMarketData(quarter, forceRefresh);
      console.log('Received market data:', data); 

      const processedData = {
        ...data,
        top_performers: data.top_performers || [],
        worst_performers: data.worst_performers || [],
        latest_results: data.latest_results || [],
        all_stocks: data.all_stocks || [],
      };

      setMarketData(processedData);
      setLastDataFetchTime(Date.now());
      setFetchErrors(0);

      const hasData = processedData.all_stocks.length > 0 || 
                     processedData.top_performers.length > 0 || 
                     processedData.latest_results.length > 0 || 
                     processedData.worst_performers.length > 0;

      if (!hasData && !forceRefresh) {
        console.log('No data received. Trying with force refresh...');
        await loadMarketData(quarter, true);
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      toast.error('Failed to fetch market data. Trying again...');
      setFetchErrors(prev => prev + 1);

      if (fetchErrors >= 1 && !forceRefresh) {
        try {
          console.log('Multiple fetch errors. Trying with force refresh...');
          await loadMarketData(quarter, true);
        } catch (retryError) {
          console.error('Retry with force refresh also failed:', retryError);
          toast.error('Still unable to fetch market data. Please try again later.');
        }
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchErrors]); // Dependency on fetchErrors to trigger retries

  // Load available quarters on initial mount
  useEffect(() => {
    const abortController = new AbortController();
    let isSubscribed = true;

    async function loadAvailableQuarters() {
      try {
        setLoading(true);
        const data = await getQuarters(false, abortController.signal);
        if (isSubscribed && data.length > 0) {
          setAvailableQuarters(data);
          const quarterToUse = quarterParam && data.includes(quarterParam) ? quarterParam : data[0];
          setSelectedQuarter(quarterToUse);
          // Initial market data load triggered by selectedQuarter change effect
        }
      } catch (error) {
        if (isSubscribed && !abortController.signal.aborted) {
          console.error('Failed to fetch quarters:', error);
          toast.error('Failed to fetch quarters. Please try again later.');
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    loadAvailableQuarters();

    return () => {
      isSubscribed = false;
      abortController.abort();
    };
  }, [quarterParam]); // Re-run if quarterParam changes (though initial load usually suffices)

  // Load market data when selectedQuarter changes
  useEffect(() => {
    if (!selectedQuarter) return;

    // Debounce/cache check: Only refetch if quarter changes, or it's been a while, or errors occurred
    if (lastQuarterFetchedRef.current === selectedQuarter) {
      const currentTime = Date.now();
      const timeSinceLastFetch = currentTime - lastDataFetchTime;
      if (timeSinceLastFetch < 300000 && fetchErrors === 0) { // 5 minutes cache
        console.log(`Using existing data for ${selectedQuarter}, fetched ${timeSinceLastFetch}ms ago`);
        return;
      }
    }
    
    loadMarketData(selectedQuarter, false);

  }, [selectedQuarter, loadMarketData, lastDataFetchTime, fetchErrors]); // Dependencies trigger reload

  return {
    marketData,
    loading,
    selectedQuarter,
    setSelectedQuarter,
    availableQuarters,
    fetchErrors,
    lastDataFetchTime,
    loadMarketData,
    activeCategory,
    setActiveCategory,
  };
} 