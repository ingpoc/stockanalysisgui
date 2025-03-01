'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Holding } from '@/types/portfolio'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const holdingFormSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  company_name: z.string().min(1, 'Company name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  average_price: z.coerce.number().min(0.01, 'Average price must be greater than 0'),
  purchase_date: z.string().optional(),
  notes: z.string().optional(),
})

type HoldingFormValues = z.infer<typeof holdingFormSchema>

interface HoldingFormProps {
  holding?: Holding
  open: boolean
  onClose: () => void
  onSubmit: (holding: Holding) => void
}

export function HoldingForm({
  holding,
  open,
  onClose,
  onSubmit,
}: HoldingFormProps) {
  const isEditing = !!holding

  const form = useForm<HoldingFormValues>({
    resolver: zodResolver(holdingFormSchema),
    defaultValues: {
      symbol: holding?.symbol || '',
      company_name: holding?.company_name || '',
      quantity: holding?.quantity || 0,
      average_price: holding?.average_price || 0,
      purchase_date: holding?.purchase_date || '',
      notes: holding?.notes || '',
    },
  })

  function handleSubmit(values: HoldingFormValues) {
    try {
      onSubmit({
        id: holding?.id,
        ...values,
      })
      
      toast.success(`${isEditing ? 'Updated' : 'Added'} holding`, {
        description: `Successfully ${isEditing ? 'updated' : 'added'} ${values.symbol}`
      })
      
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Form submission failed', {
        description: 'There was an error processing your request. Please try again.'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Holding' : 'Add Holding'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="SHAKTIPUMP" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter valid Indian stock symbols (e.g., SHAKTIPUMP, JUBLPHARMA)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Apple Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="average_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this holding"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 