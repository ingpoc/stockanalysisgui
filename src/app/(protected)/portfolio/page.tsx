'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PortfolioTable } from '@/components/portfolio/portfolio-table'
import { HoldingForm } from '@/components/portfolio/holding-form'
import { CSVUpload } from '@/components/portfolio/csv-upload'
import { PortfolioSummaryComponent } from '@/components/portfolio/portfolio-summary'
import { Holding, HoldingWithCurrentPrice } from '@/types/portfolio'
import {
  fetchHoldings,
  fetchEnrichedHoldings,
  addHolding,
  updateHolding,
  deleteHolding,
  getStockDetails,
  getBatchStockDetails,
} from '@/lib/api'
import { Plus } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<HoldingWithCurrentPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedHolding, setSelectedHolding] = useState<Holding | undefined>(
    undefined
  )

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
        setHoldings([])
        setIsLoading(false)
        return
      }
      
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
      
      setHoldings(enrichedHoldings)
    } catch (error) {
      console.error('Error loading holdings:', error)
      toast.error('Failed to load portfolio holdings')
      
      // Try fallback to basic holdings if enriched holdings failed
      try {
        const basicHoldings = await fetchHoldings()
        const fallbackHoldings = basicHoldings.map(holding => createFallbackHolding(holding))
        setHoldings(fallbackHoldings)
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
  const createFallbackHolding = (holding: Holding, errorMessage?: string): HoldingWithCurrentPrice => {
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

  // Handle adding a new holding
  const handleAddHolding = async (holding: Holding) => {
    try {
      const newHolding = await addHolding(holding)
      toast.success('Holding added successfully', {
        description: `Added ${holding.symbol} to your portfolio`
      })
      await loadHoldings()
    } catch (error) {
      console.error('Error adding holding:', error)
      toast.error('Failed to add holding', {
        description: 'Please check your input and try again'
      })
    }
  }

  // Handle updating an existing holding
  const handleUpdateHolding = async (holding: Holding) => {
    if (!holding.id) return
    
    try {
      await updateHolding(holding.id, holding)
      toast.success('Holding updated successfully', {
        description: `Updated ${holding.symbol} in your portfolio`
      })
      await loadHoldings()
    } catch (error) {
      console.error('Error updating holding:', error)
      toast.error('Failed to update holding', {
        description: 'Please check your input and try again'
      })
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

  // Handle opening the form for editing
  const handleEditHolding = (holding: HoldingWithCurrentPrice) => {
    setSelectedHolding(holding)
    setFormOpen(true)
  }

  // Handle form submission
  const handleFormSubmit = (holding: Holding) => {
    if (holding.id) {
      handleUpdateHolding(holding)
    } else {
      handleAddHolding(holding)
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
          <Button onClick={() => {
            setSelectedHolding(undefined)
            setFormOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Holding
          </Button>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummaryComponent holdings={holdings} />

        {/* Tabs for Holdings and Import */}
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
                holdings={holdings}
                onEdit={handleEditHolding}
                onDelete={handleDeleteHolding}
              />
            )}
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <div className="max-w-md mx-auto">
              <CSVUpload
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Holding Form Dialog */}
        <HoldingForm
          holding={selectedHolding}
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </div>
    </PageContainer>
  )
} 