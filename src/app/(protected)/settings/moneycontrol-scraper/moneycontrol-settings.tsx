"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Define the result types and their corresponding URLs
const SCRAPE_OPTIONS = [
  { 
    label: 'Latest Results', 
    value: 'LR', 
    url: 'https://www.moneycontrol.com/markets/earnings/latest-results/?tab=LR&subType=yoy'
  },
  { 
    label: 'Best Performer', 
    value: 'BP', 
    url: 'https://www.moneycontrol.com/markets/earnings/latest-results/?tab=BP&subType=yoy'
  },
  { 
    label: 'Worst Performer', 
    value: 'WP', 
    url: 'https://www.moneycontrol.com/markets/earnings/latest-results/?tab=WP&subType=yoy'
  },
  { 
    label: 'Positive Turnaround', 
    value: 'PT', 
    url: 'https://www.moneycontrol.com/markets/earnings/latest-results/?tab=PT&subType=yoy'
  },
  { 
    label: 'Negative Turnaround', 
    value: 'NT', 
    url: 'https://www.moneycontrol.com/markets/earnings/latest-results/?tab=NT&subType=yoy'
  }
]

// Define the ScrapeResponse interface based on our backend schema
interface ScrapeResponse {
  success: boolean
  message: string
  companies_scraped: number
  data?: any[]
}

export default function MoneyControlScraperSettings() {
  const [selectedOption, setSelectedOption] = useState<string>('LR')
  const [url, setUrl] = useState<string>(SCRAPE_OPTIONS[0].url)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [lastScrapeResult, setLastScrapeResult] = useState<ScrapeResponse | null>(null)
  const [progress, setProgress] = useState<number>(0)

  // Handle changing the scrape type
  const handleOptionChange = (value: string) => {
    setSelectedOption(value)
    const option = SCRAPE_OPTIONS.find(opt => opt.value === value)
    if (option) {
      setUrl(option.url)
    }
  }

  const handleScrape = async () => {
    if (!url.includes('moneycontrol.com')) {
      toast.error('Please enter a valid MoneyControl URL')
      return
    }

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
        body: JSON.stringify({ url }),
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

  const handleViewScrapedData = () => {
    window.open('/dashboard?filter=latest_scraped', '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="scrape-type">Result Type</Label>
        <Select
          value={selectedOption}
          onValueChange={handleOptionChange}
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

      <div className="space-y-2">
        <Label htmlFor="moneycontrol-url">MoneyControl URL</Label>
        <Input
          id="moneycontrol-url"
          placeholder="https://www.moneycontrol.com/stocks/earnings/results.html"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          URL will be automatically updated based on the selected result type, but you can modify it if needed
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
          ) : (
            'Start Scraping'
          )}
        </Button>
        
        {lastScrapeResult?.success && (
          <Button 
            variant="outline" 
            onClick={handleViewScrapedData}
            className="w-full sm:w-auto"
          >
            View Scraped Data
          </Button>
        )}
      </div>

      {lastScrapeResult && (
        <Alert variant={lastScrapeResult.success ? "default" : "destructive"}>
          <AlertTitle>
            {lastScrapeResult.success ? "Scraping Completed" : "Scraping Failed"}
          </AlertTitle>
          <AlertDescription>
            {lastScrapeResult.message}
            {lastScrapeResult.companies_scraped > 0 && (
              <p className="mt-2">
                Successfully scraped {lastScrapeResult.companies_scraped} companies.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 