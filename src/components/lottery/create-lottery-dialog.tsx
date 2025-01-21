'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LotteryType } from '@/types/lottery'
import { toast } from 'sonner'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { LotteryProgram } from '@/lib/solana/program'
import { handleProgramError } from '@/lib/utils'

interface CreateLotteryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateLotteryDialog({ open, onOpenChange, onSuccess }: CreateLotteryDialogProps) {
  const { publicKey, wallet } = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<LotteryType>(LotteryType.Daily)
  const [ticketPrice, setTicketPrice] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !connection) return

    try {
      setLoading(true)
      const price = parseFloat(ticketPrice) * LAMPORTS_PER_SOL
      const adapter = wallet?.adapter as BaseSignerWalletAdapter
      if (!adapter) return

      // Calculate start and end times based on lottery type
      const now = Math.floor(Date.now() / 1000)
      let duration: number
      switch (type) {
        case LotteryType.Daily:
          duration = 24 * 60 * 60 // 1 day in seconds
          break
        case LotteryType.Weekly:
          duration = 7 * 24 * 60 * 60 // 1 week in seconds
          break
        case LotteryType.Monthly:
          duration = 30 * 24 * 60 * 60 // 30 days in seconds
          break
      }

      const program = new LotteryProgram(connection, {
        publicKey,
        signTransaction: adapter.signTransaction.bind(adapter),
        signAllTransactions: adapter.signAllTransactions.bind(adapter),
      })

      await program.createLottery(
        type,
        price,
        now,
        now + duration
      )
      
      toast.success('Lottery created successfully!')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Failed to create lottery:', error)
      toast.error(handleProgramError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Lottery</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Lottery Type</Label>
            <Select
              value={type}
              onValueChange={(value: string) => setType(value as LotteryType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lottery type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LotteryType.Daily}>Daily Lottery</SelectItem>
                <SelectItem value={LotteryType.Weekly}>Weekly Lottery</SelectItem>
                <SelectItem value={LotteryType.Monthly}>Monthly Lottery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticketPrice">Ticket Price (SOL)</Label>
            <Input
              id="ticketPrice"
              type="number"
              step="0.01"
              min="0"
              value={ticketPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketPrice(e.target.value)}
              placeholder="Enter ticket price in SOL"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Lottery'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 