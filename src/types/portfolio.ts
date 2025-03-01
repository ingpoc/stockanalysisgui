export interface Holding {
  id?: string;
  symbol: string;
  company_name: string;
  quantity: number;
  average_price: number;
  purchase_date?: string;
  notes?: string;
  timestamp?: string;
  asset_type?: 'stock' | 'crypto' | 'mutual_fund';
}

export interface CryptoHolding extends Omit<Holding, 'asset_type'> {
  asset_type: 'crypto';
}

export interface MutualFundHolding extends Omit<Holding, 'asset_type'> {
  asset_type: 'mutual_fund';
  nav?: number; // Net Asset Value
  folio_number?: string;
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

export interface CryptoHoldingWithCurrentPrice extends Omit<HoldingWithCurrentPrice, 'asset_type'>, CryptoHolding {}

export interface MutualFundHoldingWithCurrentPrice extends Omit<HoldingWithCurrentPrice, 'asset_type'>, MutualFundHolding {} 