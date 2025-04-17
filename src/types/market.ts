export type StockCategory = "top-performers" | "worst-performers" | "latest-results" | "all-stocks";

export interface Stock {
  company_name: string;
  symbol: string;
  cmp: string;
  net_profit_growth: string;
  strengths: string;
  weaknesses: string;
  piotroski_score: string;
  estimates: string;
  result_date: string;
  recommendation: string;
}

export interface MarketOverview {
  quarter: string;
  top_performers: Stock[];
  worst_performers: Stock[];
  latest_results: Stock[];
  all_stocks: Stock[];
}

export interface FinancialMetric {
  market_cap: string;
  face_value: string;
  book_value: string;
  dividend_yield: string;
  ttm_eps: string;
  ttm_pe: string;
  pb_ratio: string;
  sector_pe: string;
  piotroski_score: string;
  revenue_growth_3yr_cagr: string;
  net_profit_growth_3yr_cagr: string;
  operating_profit_growth_3yr_cagr: string;
  strengths: string;
  weaknesses: string;
  technicals_trend: string;
  fundamental_insights: string;
  fundamental_insights_description: string;
  revenue: string;
  gross_profit: string;
  net_profit: string;
  net_profit_growth: string;
  result_date: string;
  gross_profit_growth: string;
  revenue_growth: string;
  quarter: string;
  report_type: string;
  cmp: string;
  estimates: string;
}

export interface FormattedMetrics {
  company_name: string;
  symbol: string;
  cmp: string;
  net_profit_growth: string;
  strengths: string;
  weaknesses: string;
  piotroski_score: string;
  estimates: string;
  result_date: string;
  recommendation: string;
}

export interface ScrapingStatus {
  is_scraping: boolean;
  last_scrape_time: string | null;
} 