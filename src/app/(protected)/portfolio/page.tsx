'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PortfolioTable } from '@/components/portfolio/portfolio-table'
import { CSVUpload } from '@/components/portfolio/csv-upload'
import { PortfolioSummaryComponent } from '@/components/portfolio/portfolio-summary'
import { HoldingWithCurrentPrice } from '@/types/portfolio'
import {
  fetchHoldings,
  fetchEnrichedHoldings,
  deleteHolding,
} from '@/lib/api'
import { PageContainer } from '@/components/layout/page-container'

export default function PortfolioPage() {
  const [stockHoldings, setStockHoldings] = useState<HoldingWithCurrentPrice[]>([])
  const [cryptoHoldings, setCryptoHoldings] = useState<HoldingWithCurrentPrice[]>([])
  const [mutualFundHoldings, setMutualFundHoldings] = useState<HoldingWithCurrentPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stocks')

  // Fetch holdings on component mount
  useEffect(() => {
    loadHoldings()
  }, [])

  // Load holdings and enrich with current prices
  const loadHoldings = async () => {
    setIsLoading(true)
    try {
      // Get enriched holdings directly from the backend in a single API call
      const enrichedHoldings = await fetchEnrichedHoldings()
      
      if (enrichedHoldings.length === 0) {
        setStockHoldings([])
        setCryptoHoldings([])
        setMutualFundHoldings([])
        setIsLoading(false)
        return
      }
      
      // Separate holdings by asset type
      const stocks = enrichedHoldings.filter(h => !h.asset_type || h.asset_type === 'stock')
      const crypto = enrichedHoldings.filter(h => h.asset_type === 'crypto')
      const mutualFunds = enrichedHoldings.filter(h => h.asset_type === 'mutual_fund')
      
      // Check if any holdings had errors and notify the user
      const holdingsWithErrors = enrichedHoldings.filter(h => h.hasError)
      if (holdingsWithErrors.length > 0) {
        const errorSymbols = holdingsWithErrors.map(h => h.symbol).join(', ')
        toast.warning(`Some holdings could not fetch live prices: ${errorSymbols}`, {
          description: 'Using purchase price as fallback',
          duration: 5000
        })
      } else {
        toast.success(`Loaded ${enrichedHoldings.length} holdings with current prices`)
      }
      
      setStockHoldings(stocks)
      setCryptoHoldings(crypto)
      setMutualFundHoldings(mutualFunds)
    } catch (error) {
      console.error('Error loading holdings:', error)
      toast.error('Failed to load portfolio holdings')
      
      // Try fallback to basic holdings if enriched holdings failed
      try {
        const basicHoldings = await fetchHoldings()
        
        // Separate holdings by asset type
        const stocks = basicHoldings.filter(h => !h.asset_type || h.asset_type === 'stock')
          .map(holding => createFallbackHolding(holding))
        const crypto = basicHoldings.filter(h => h.asset_type === 'crypto')
          .map(holding => createFallbackHolding(holding))
        const mutualFunds = basicHoldings.filter(h => h.asset_type === 'mutual_fund')
          .map(holding => createFallbackHolding(holding))
        
        setStockHoldings(stocks)
        setCryptoHoldings(crypto)
        setMutualFundHoldings(mutualFunds)
        
        toast.warning('Using basic holdings without current prices', {
          description: 'Could not fetch enriched holdings with pricing data'
        })
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Helper function to create a fallback holding when price data can't be fetched
  const createFallbackHolding = (holding: any, errorMessage?: string): HoldingWithCurrentPrice => {
    const investmentValue = holding.average_price * holding.quantity
    return {
      ...holding,
      currentPrice: holding.average_price, // Use average price as fallback
      currentValue: investmentValue,
      gainLoss: 0,
      gainLossPercentage: 0,
      hasError: true, // Mark this holding as having an error
      errorMessage: errorMessage || `Could not fetch current price for ${holding.symbol}. Symbol may not exist in database.`
    }
  }

  // Handle deleting a holding
  const handleDeleteHolding = async (id: string) => {
    try {
      await deleteHolding(id)
      toast.success('Holding deleted successfully', {
        description: 'The holding has been removed from your portfolio'
      })
      await loadHoldings()
    } catch (error) {
      console.error('Error deleting holding:', error)
      toast.error('Failed to delete holding', {
        description: 'An error occurred while deleting the holding'
      })
    }
  }

  // Handle CSV upload success
  const handleUploadSuccess = () => {
    toast.success('Holdings imported successfully', {
      description: 'Your portfolio has been updated with the imported holdings'
    })
    loadHoldings()
  }

  // Handle CSV upload error
  const handleUploadError = (error: string) => {
    toast.error('Failed to import holdings', {
      description: error
    })
  }

  return (
    <PageContainer>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Portfolio</h1>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummaryComponent 
          holdings={[...stockHoldings, ...cryptoHoldings, ...mutualFundHoldings]} 
        />

        {/* Main Tabs for Asset Types */}
        <Tabs 
          defaultValue="stocks" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
          </TabsList>
          
          {/* Stocks Tab */}
          <TabsContent value="stocks" className="space-y-4">
            <Tabs defaultValue="holdings" className="w-full">
              <TabsList>
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="import">Import CSV</TabsTrigger>
              </TabsList>
              
              <TabsContent value="holdings" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <PortfolioTable
                    holdings={stockHoldings}
                    onDelete={handleDeleteHolding}
                    assetType="stock"
                  />
                )}
              </TabsContent>
              
              <TabsContent value="import" className="space-y-4">
                <div className="max-w-md mx-auto">
                  <CSVUpload
                    onSuccess={handleUploadSuccess}
                    onError={handleUploadError}
                    assetType="stock"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          {/* Crypto Tab */}
          <TabsContent value="crypto" className="space-y-4">
            <Tabs defaultValue="holdings" className="w-full">
              <TabsList>
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="import">Import CSV</TabsTrigger>
              </TabsList>
              
              <TabsContent value="holdings" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <PortfolioTable
                    holdings={cryptoHoldings}
                    onDelete={handleDeleteHolding}
                    assetType="crypto"
                  />
                )}
              </TabsContent>
              
              <TabsContent value="import" className="space-y-4">
                <div className="max-w-md mx-auto">
                  <CSVUpload
                    onSuccess={handleUploadSuccess}
                    onError={handleUploadError}
                    assetType="crypto"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          {/* Mutual Funds Tab */}
          <TabsContent value="mutual-funds" className="space-y-4">
            <Tabs defaultValue="holdings" className="w-full">
              <TabsList>
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="import">Import CSV</TabsTrigger>
              </TabsList>
              
              <TabsContent value="holdings" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <PortfolioTable
                    holdings={mutualFundHoldings}
                    onDelete={handleDeleteHolding}
                    assetType="mutual_fund"
                  />
                )}
              </TabsContent>
              
              <TabsContent value="import" className="space-y-4">
                <div className="max-w-md mx-auto">
                  <CSVUpload
                    onSuccess={handleUploadSuccess}
                    onError={handleUploadError}
                    assetType="mutual_fund"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
} 