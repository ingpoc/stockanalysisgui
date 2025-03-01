export interface Holding {
  id?: string;
  symbol: string;
  company_name: string;
  quantity: number;
  average_price: number;
  purchase_date?: string;
  notes?: string;
  timestamp?: string;
}

export interface HoldingsList {
  holdings: Holding[];
}

export interface PortfolioSummary {
  totalInvestment: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
}

export interface HoldingWithCurrentPrice extends Holding {
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercentage?: number;
  hasError?: boolean;
  errorMessage?: string;
} 