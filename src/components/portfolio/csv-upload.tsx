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
}

export function CSVUpload({ onSuccess, onError }: CSVUploadProps) {
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
      await importHoldingsFromCSV(file)
      setFile(null)
      toast.success('Holdings imported successfully', {
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="csv-file">Upload Holdings CSV</Label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <p className="text-sm text-muted-foreground">
          CSV should have columns: symbol, company_name, quantity, average_price, purchase_date (optional), notes (optional)
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <strong>Note:</strong> Use valid Indian stock symbols like "SHAKTIPUMP" or "JUBLPHARMA". International symbols like AAPL or MSFT may not be available.
        </p>
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