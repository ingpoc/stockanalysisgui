'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { HoldingWithCurrentPrice } from '@/types/portfolio'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { AlertCircle, MoreHorizontal, TrendingDown, TrendingUp, RefreshCw, Minus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { StockRecommendation, getStockRecommendation, getPortfolioRecommendations } from '@/lib/api'
import { StockRecommendationDisplay } from '@/components/portfolio/recommendations/stock-recommendation'
import { toast } from 'sonner'

interface PortfolioTableProps {
  holdings: HoldingWithCurrentPrice[]
  onDelete: (id: string) => void
  assetType?: 'stock' | 'crypto' | 'mutual_fund'
  showRecommendations?: boolean
  initialRecommendations?: Record<string, StockRecommendation>
}

export function PortfolioTable({ 
  holdings, 
  onDelete, 
  assetType = 'stock',
  showRecommendations = true,
  initialRecommendations = {}
}: PortfolioTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [recommendations, setRecommendations] = useState<Record<string, StockRecommendation>>(initialRecommendations)  
  const [loadingRecommendations, setLoadingRecommendations] = useState<Record<string, boolean>>({})
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  
  // On mount, if no initial recommendations, fetch portfolio-level recommendations
  useEffect(() => {
    const hasInitial = Object.keys(initialRecommendations || {}).length > 0
    if (!hasInitial && showRecommendations) {
      getPortfolioRecommendations()
        .then(res => setRecommendations(res.recommendations))
        .catch(err => console.error('Failed to load portfolio recommendations in table', err))
    }
  }, [initialRecommendations, showRecommendations])
  
  // Sync internal recommendations when parent prop changes
  useEffect(() => {
    if (initialRecommendations && Object.keys(initialRecommendations).length > 0) {
      setRecommendations(initialRecommendations)
    }
  }, [initialRecommendations])
  
  const filteredHoldings = holdings.filter(holding => 
    holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (holding.company_name && holding.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  // Remove duplicate symbols: keep first occurrence of each symbol
  const uniqueHoldings = filteredHoldings.filter((holding, index) => 
    filteredHoldings.findIndex(h => h.symbol === holding.symbol) === index
  )
  
  const totalInvestment = holdings.reduce((sum, holding) => sum + (holding.average_price * holding.quantity), 0)
  const totalCurrentValue = holdings.reduce((sum, holding) => sum + (holding.currentValue || 0), 0)
  const totalGainLoss = totalCurrentValue - totalInvestment
  const totalGainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0
  
  const getTableHeaders = () => {
    switch (assetType) {
      case 'crypto':
        return (
          <TableRow>
            <TableHead>Coin</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Avg. Price</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Gain/Loss</TableHead>
            <TableHead>%</TableHead>
            {showRecommendations && <TableHead>Recommendation</TableHead>}
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        );
      case 'mutual_fund':
        return (
          <TableRow>
            <TableHead>Scheme Name</TableHead>
            <TableHead>Folio No.</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Avg. NAV</TableHead>
            <TableHead>Current NAV</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Gain/Loss</TableHead>
            <TableHead>%</TableHead>
            {showRecommendations && <TableHead>Recommendation</TableHead>}
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        );
      default: // stock
        return (
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Avg. Price</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Gain/Loss</TableHead>
            <TableHead>%</TableHead>
            {showRecommendations && <TableHead>Recommendation</TableHead>}
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        );
    }
  };

  const getSearchPlaceholder = () => {
    switch (assetType) {
      case 'crypto':
        return 'Search coins...';
      case 'mutual_fund':
        return 'Search schemes...';
      default:
        return 'Search holdings...';
    }
  };
  
  const toggleRow = (symbol: string) => {
    setExpandedRows(prev => ({ ...prev, [symbol]: !prev[symbol] }))
  }
  
  // Function to load recommendation for a specific stock
  const loadRecommendation = async (symbol: string) => {
    // Set loading state for this specific symbol
    setLoadingRecommendations(prev => ({
      ...prev,
      [symbol]: true
    }))
    
    console.log(`Fetching recommendation for ${symbol}...`)
    try {
      // Log the API URL for debugging
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      console.log(`Requesting from: ${apiBaseUrl}/recommendations/stock/${symbol}`)
      
      const recommendation = await getStockRecommendation(symbol)
      console.log(`Successfully received recommendation for ${symbol}:`, recommendation)
      
      // Update recommendations state with the new recommendation
      setRecommendations(prev => ({
        ...prev,
        [symbol]: recommendation
      }))
      
      toast.success(`Received recommendation for ${symbol}`)
    } catch (error) {
      console.error(`Failed to load recommendation for ${symbol}:`, error)
      toast.error(`Failed to load recommendation for ${symbol}`, {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      // Clear loading state for this symbol
      setLoadingRecommendations(prev => ({
        ...prev,
        [symbol]: false
      }))
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder={getSearchPlaceholder()}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {uniqueHoldings.length} of {holdings.length} {assetType === 'mutual_fund' ? 'schemes' : assetType === 'crypto' ? 'coins' : 'holdings'}
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {getTableHeaders()}
          </TableHeader>
          <TableBody>
            {uniqueHoldings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={assetType === 'mutual_fund' ? (showRecommendations ? 10 : 9) : (showRecommendations ? 9 : 8)} className="text-center">
                  No {assetType === 'mutual_fund' ? 'schemes' : assetType === 'crypto' ? 'coins' : 'holdings'} found
                </TableCell>
              </TableRow>
            ) : (
              <>
                {uniqueHoldings.map((holding, index) => (
                  <TableRow key={holding.id || `row-${holding.symbol}-${holding.quantity}-${index}`} className={holding.hasError ? "bg-red-50 dark:bg-red-900/10" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        {holding.symbol}
                        {holding.hasError && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{holding.errorMessage}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    {assetType === 'mutual_fund' && (
                      <TableCell>{(holding as any).folio_number || 'N/A'}</TableCell>
                    )}
                    <TableCell>{holding.quantity.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(holding.average_price)}</TableCell>
                    <TableCell>
                      {holding.hasError ? (
                        <span className="text-amber-500">{formatCurrency(holding.currentPrice || holding.average_price)}</span>
                      ) : (
                        formatCurrency(holding.currentPrice || holding.average_price)
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(holding.currentValue || holding.average_price * holding.quantity)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {(holding.gainLoss || 0) > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (holding.gainLoss || 0) < 0 ? (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        ) : null}
                        {formatCurrency(holding.gainLoss || 0)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          (holding.gainLossPercentage || 0) > 0
                            ? 'text-green-500'
                            : (holding.gainLossPercentage || 0) < 0
                            ? 'text-red-500'
                            : ''
                        }
                      >
                        {formatPercentage(holding.gainLossPercentage || 0)}
                      </span>
                    </TableCell>
                    {showRecommendations && (
                      <TableCell>
                        {recommendations[holding.symbol] ? (
                          <details
                            open={!!expandedRows[holding.symbol]}
                            className="space-y-2"
                          >
                            <summary
                              onClick={(e) => { e.preventDefault(); toggleRow(holding.symbol); }}
                              className="flex justify-between items-center cursor-pointer"
                            >
                              <div className="flex items-center">
                                {recommendations[holding.symbol].action === 'BUY' ? (
                                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                ) : recommendations[holding.symbol].action === 'SELL' ? (
                                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                ) : (
                                  <Minus className="h-4 w-4 text-blue-500 mr-1" />
                                )}
                                <span className="font-medium">
                                  {recommendations[holding.symbol].action} ({recommendations[holding.symbol].confidence}%)
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {recommendations[holding.symbol].timeframe}
                              </span>
                            </summary>
                            <div className="pl-4 text-sm space-y-1">
                              {recommendations[holding.symbol].reasons.map((reason, idx) => (
                                <div key={idx}>• {reason}</div>
                              ))}
                              {recommendations[holding.symbol].target_price != null && (
                                <div>
                                  Target Price: {formatCurrency(recommendations[holding.symbol].target_price!)}
                                </div>
                              )}
                              {recommendations[holding.symbol].stop_loss != null && (
                                <div>
                                  Stop Loss: {formatCurrency(recommendations[holding.symbol].stop_loss!)}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                Generated: {new Date(recommendations[holding.symbol].timestamp).toLocaleString()}
                              </div>
                            </div>
                          </details>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadRecommendation(holding.symbol)}
                            disabled={loadingRecommendations[holding.symbol]}
                          >
                            {loadingRecommendations[holding.symbol] ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              'Get'                        
                            )}
                          </Button>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${holding.symbol}?`)) {
                                onDelete(holding.id as string)
                              }
                            }}
                            className="text-red-500"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Summary row */}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={assetType === 'mutual_fund' ? 5 : 4} className="text-right">Total:</TableCell>
                  <TableCell>{formatCurrency(totalCurrentValue)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {totalGainLoss > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : totalGainLoss < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      ) : null}
                      {formatCurrency(totalGainLoss)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        totalGainLossPercentage > 0
                          ? 'text-green-500'
                          : totalGainLossPercentage < 0
                          ? 'text-red-500'
                          : ''
                      }
                    >
                      {formatPercentage(totalGainLossPercentage)}
                    </span>
                  </TableCell>
                  {showRecommendations && <TableCell></TableCell>}
                  <TableCell></TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
