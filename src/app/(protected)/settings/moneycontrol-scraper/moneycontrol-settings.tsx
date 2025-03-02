"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuarters } from '@/lib/api'

// Define the result types
const SCRAPE_OPTIONS = [
  { 
    label: 'Latest Results', 
    value: 'LR'
  },
  { 
    label: 'Best Performer', 
    value: 'BP'
  },
  { 
    label: 'Worst Performer', 
    value: 'WP'
  },
  { 
    label: 'Positive Turnaround', 
    value: 'PT'
  },
  { 
    label: 'Negative Turnaround', 
    value: 'NT'
  }
]

// Define the ScrapeResponse interface based on our backend schema
interface ScrapeResponse {
  success: boolean
  message: string
  companies_scraped: number
  data?: any[]
}

// Define the RemoveQuarterResponse interface
interface RemoveQuarterResponse {
  success: boolean
  message: string
  documents_updated: number
}

export default function MoneyControlScraperSettings() {
  const [selectedOption, setSelectedOption] = useState<string>('LR')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [lastScrapeResult, setLastScrapeResult] = useState<ScrapeResponse | null>(null)
  const [progress, setProgress] = useState<number>(0)
  
  // State for quarter removal
  const [selectedQuarter, setSelectedQuarter] = useState<string>('')
  const [isRemovingQuarter, setIsRemovingQuarter] = useState<boolean>(false)
  const [lastRemoveResult, setLastRemoveResult] = useState<RemoveQuarterResponse | null>(null)
  const [quarters, setQuarters] = useState<string[]>([])
  const [loadingQuarters, setLoadingQuarters] = useState<boolean>(true)

  // Fetch quarters from the database
  useEffect(() => {
    const abortController = new AbortController()

    async function loadQuarters() {
      setLoadingQuarters(true)
      try {
        const data = await getQuarters(abortController.signal)
        if (data.length > 0) {
          setQuarters(data)
          setSelectedQuarter(data[0])
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Failed to fetch quarters:', error)
          toast.error('Failed to fetch quarters. Please try again later.')
        }
      } finally {
        setLoadingQuarters(false)
      }
    }

    loadQuarters()

    return () => {
      abortController.abort()
    }
  }, [])

  const handleScrape = async () => {
    setIsLoading(true)
    setProgress(10)
    setLastScrapeResult(null)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 2000)

      const response = await fetch('/api/scraper/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result_type: selectedOption }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to trigger scraper')
      }

      const result = await response.json()
      setLastScrapeResult(result)
      
      if (result.success) {
        toast.success(`Successfully scraped ${result.companies_scraped || 0} companies`)
      } else {
        toast.warning(result.message || 'Scraping completed with warnings')
      }
    } catch (error) {
      console.error('Error triggering scraper:', error)
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to trigger scraper'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveQuarter = async () => {
    if (!selectedQuarter) {
      toast.error('Please select a quarter to remove')
      return
    }

    // Show confirmation dialog
    if (!confirm(`Are you sure you want to remove all ${selectedQuarter} data from the database? This action cannot be undone.`)) {
      return
    }

    setIsRemovingQuarter(true)
    setLastRemoveResult(null)

    try {
      const response = await fetch('/api/scraper/remove-quarter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quarter: selectedQuarter }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to remove quarterly data')
      }

      setLastRemoveResult(result)
      
      if (result.success) {
        toast.success(`Successfully removed ${selectedQuarter} data from ${result.documents_updated || 0} companies`)
      } else {
        toast.warning(result.message || 'Operation completed with warnings')
      }
    } catch (error) {
      console.error('Error removing quarter data:', error)
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsRemovingQuarter(false)
    }
  }

  const handleViewScrapedData = () => {
    window.open('/dashboard?filter=latest_scraped', '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Scraping Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Scrape Financial Data</h3>
        
        <div className="space-y-2">
          <Label htmlFor="scrape-type">Result Type</Label>
          <Select
            value={selectedOption}
            onValueChange={setSelectedOption}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select result type to scrape" />
            </SelectTrigger>
            <SelectContent>
              {SCRAPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Select the type of results you want to scrape from MoneyControl
          </p>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Scraping in progress... This might take a few minutes.
            </p>
          </div>
        )}

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button 
            onClick={handleScrape} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : 'Start Scraping'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleViewScrapedData}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            View Scraped Data
          </Button>
        </div>

        {lastScrapeResult && (
          <Alert variant={lastScrapeResult.success ? "default" : "destructive"}>
            <AlertTitle>
              {lastScrapeResult.success ? "Scraping Completed" : "Scraping Error"}
            </AlertTitle>
            <AlertDescription>
              {lastScrapeResult.message}
              {lastScrapeResult.companies_scraped > 0 && (
                <p className="mt-2">
                  Successfully scraped data for {lastScrapeResult.companies_scraped} companies.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      {/* Data Management Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Data Management</h3>
        
        <Card>
          <CardHeader>
            <CardTitle>Remove Quarterly Data</CardTitle>
            <CardDescription>
              Remove all financial data for a specific quarter from the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quarter-select">Select Quarter</Label>
                <Select
                  value={selectedQuarter}
                  onValueChange={setSelectedQuarter}
                  disabled={isRemovingQuarter || loadingQuarters}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingQuarters ? "Loading quarters..." : "Select quarter to remove"} />
                  </SelectTrigger>
                  <SelectContent>
                    {quarters.map((quarter) => (
                      <SelectItem key={quarter} value={quarter}>
                        {quarter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This will remove all financial data for the selected quarter from all companies
                </p>
              </div>
              
              <Button 
                variant="destructive" 
                onClick={handleRemoveQuarter}
                disabled={isRemovingQuarter || !selectedQuarter || loadingQuarters}
              >
                {isRemovingQuarter ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : 'Remove Quarter Data'}
              </Button>
              
              {lastRemoveResult && (
                <Alert variant={lastRemoveResult.success ? "default" : "destructive"}>
                  <AlertTitle>
                    {lastRemoveResult.success ? "Data Removal Completed" : "Data Removal Error"}
                  </AlertTitle>
                  <AlertDescription>
                    {lastRemoveResult.message}
                    {lastRemoveResult.documents_updated > 0 && (
                      <p className="mt-2">
                        Updated {lastRemoveResult.documents_updated} documents in the database.
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 