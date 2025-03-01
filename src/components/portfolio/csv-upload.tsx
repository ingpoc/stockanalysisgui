'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Upload } from 'lucide-react'
import { importHoldingsFromCSV } from '@/lib/api'
import { toast } from 'sonner'

interface CSVUploadProps {
  onSuccess: () => void
  onError: (error: string) => void
  assetType: 'stock' | 'crypto' | 'mutual_fund'
}

export function CSVUpload({ onSuccess, onError, assetType }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file')
        toast.error('Invalid file type', {
          description: 'Please select a CSV file'
        })
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload')
      toast.error('No file selected', {
        description: 'Please select a file to upload'
      })
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      await importHoldingsFromCSV(file, assetType)
      setFile(null)
      toast.success(`${getAssetTypeLabel(assetType)} imported successfully`, {
        description: 'Your portfolio has been updated with the imported holdings'
      })
      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload CSV'
      setError(errorMessage)
      toast.error('Import failed', {
        description: errorMessage
      })
      onError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const getAssetTypeLabel = (type: 'stock' | 'crypto' | 'mutual_fund') => {
    switch (type) {
      case 'stock':
        return 'Stock holdings';
      case 'crypto':
        return 'Crypto holdings';
      case 'mutual_fund':
        return 'Mutual fund holdings';
    }
  }

  const getCSVFormatHelp = (type: 'stock' | 'crypto' | 'mutual_fund') => {
    switch (type) {
      case 'stock':
        return (
          <>
            <p className="text-sm text-muted-foreground">
              CSV should have columns: "Instrument", "Qty.", "Avg. cost", "LTP", "Invested", "Cur. val", "P&L", "Net chg.", "Day chg."
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Note:</strong> The CSV format should match the export from Zerodha or similar Indian brokers.
            </p>
          </>
        );
      case 'crypto':
        return (
          <>
            <p className="text-sm text-muted-foreground">
              CSV should have columns: "Coin", "Quantity", "Avg. Buy Price", "Current Price", "Investment", "Current Value", "P&L"
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Note:</strong> The CSV format should match the export from WazirX, CoinDCX or similar crypto exchanges.
            </p>
          </>
        );
      case 'mutual_fund':
        return (
          <>
            <p className="text-sm text-muted-foreground">
              CSV should have columns: "Scheme Name", "Folio No.", "Units", "Avg. NAV", "Current NAV", "Investment", "Current Value", "P&L"
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Note:</strong> The CSV format should match the export from Kuvera, Groww or similar mutual fund platforms.
            </p>
          </>
        );
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="csv-file">Upload {getAssetTypeLabel(assetType)} CSV</Label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {getCSVFormatHelp(assetType)}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <span className="flex items-center">
            <span className="mr-2">Uploading...</span>
          </span>
        ) : (
          <span className="flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </span>
        )}
      </Button>
    </div>
  )
} 