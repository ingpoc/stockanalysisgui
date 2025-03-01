'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Holding } from '@/types/portfolio'
import { Loader2 } from 'lucide-react'

interface HoldingsDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  editHolding: Holding | null
  onSuccess: () => void
}

export function HoldingsDialog({
  open,
  setOpen,
  editHolding,
  onSuccess,
}: HoldingsDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [symbol, setSymbol] = React.useState('')
  const [quantity, setQuantity] = React.useState('')
  const [averagePrice, setAveragePrice] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [errors, setErrors] = React.useState<{
    symbol?: string;
    quantity?: string;
    averagePrice?: string;
  }>({})

  // Calculate estimated value
  const estimatedValue = React.useMemo(() => {
    const qty = parseFloat(quantity || '0')
    const price = parseFloat(averagePrice || '0')
    if (isNaN(qty) || isNaN(price)) return 0
    return qty * price
  }, [quantity, averagePrice])

  React.useEffect(() => {
    if (editHolding) {
      setSymbol(editHolding.symbol)
      setQuantity(String(editHolding.quantity))
      setAveragePrice(String(editHolding.average_price))
      setNotes(editHolding.notes || '')
    } else {
      setSymbol('')
      setQuantity('')
      setAveragePrice('')
      setNotes('')
    }
  }, [editHolding, open])

  const validateForm = () => {
    const newErrors: {
      symbol?: string;
      quantity?: string;
      averagePrice?: string;
    } = {}
    
    if (!symbol) {
      newErrors.symbol = 'Stock symbol is required'
    } else if (!/^[A-Z0-9&.]+$/.test(symbol)) {
      newErrors.symbol = 'Please enter a valid stock symbol'
    }
    
    if (!quantity) {
      newErrors.quantity = 'Quantity is required'
    } else if (parseFloat(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }
    
    if (!averagePrice) {
      newErrors.averagePrice = 'Average price is required'
    } else if (parseFloat(averagePrice) <= 0) {
      newErrors.averagePrice = 'Average price must be greater than 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    try {
      const formData = {
        symbol,
        quantity: parseFloat(quantity),
        average_price: parseFloat(averagePrice),
        purchase_date: new Date(),
        notes,
      }

      const response = await fetch(
        editHolding 
          ? `/api/holdings/${editHolding.id}` 
          : '/api/holdings',
        {
          method: editHolding ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save holding')
      }
      
      toast({
        title: editHolding ? 'Holding updated' : 'Holding added',
        description: editHolding
          ? `Successfully updated ${symbol} holding.`
          : `Successfully added ${symbol} to your portfolio.`,
      })
      
      onSuccess()
      setOpen(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save holding. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSymbol('')
    setQuantity('')
    setAveragePrice('')
    setNotes('')
    setErrors({})
  }

  // Convert symbol to uppercase on change
  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(e.target.value.toUpperCase())
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) resetForm()
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editHolding ? 'Edit Holding' : 'Add New Holding'}
          </DialogTitle>
          <DialogDescription>
            {editHolding
              ? 'Update the details of your stock holding.'
              : 'Enter the details of your stock holding.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="symbol">
                Stock Symbol <span className="text-red-500">*</span>
              </Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={handleSymbolChange}
                placeholder="e.g., RELIANCE, INFY, TCS"
                className="uppercase"
              />
              {errors.symbol && (
                <p className="text-red-500 text-sm">{errors.symbol}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Number of shares"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm">{errors.quantity}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="average_price">
                Average Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="average_price"
                type="number"
                step="0.01"
                value={averagePrice}
                onChange={(e) => setAveragePrice(e.target.value)}
                placeholder="Price per share"
              />
              {errors.averagePrice && (
                <p className="text-red-500 text-sm">{errors.averagePrice}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Total Value: ₹{estimatedValue.toLocaleString()}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this purchase"
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editHolding ? 'Update' : 'Add'} Holding
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 