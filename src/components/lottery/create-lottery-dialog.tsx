'use client'

import { useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useLotteryProgram } from '@/lib/solana/program'
import { LotteryType } from '@/types/lottery'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

interface CreateLotteryDialogProps {
  onCreated: () => void
}

export function CreateLotteryDialog({ onCreated }: CreateLotteryDialogProps) {
  const { address } = useAppKitAccount()
  const program = useLotteryProgram()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lotteryType, setLotteryType] = useState<LotteryType>(LotteryType.Daily)
  const [ticketPrice, setTicketPrice] = useState('')

  const handleCreate = async () => {
    if (!program || !address) return

    try {
      setLoading(true)
      const price = parseFloat(ticketPrice)
      if (isNaN(price) || price <= 0) {
        throw new Error('Invalid ticket price')
      }

      const startTime = Math.floor(Date.now() / 1000)
      let endTime: number

      switch (lotteryType) {
        case LotteryType.Daily:
          endTime = startTime + 24 * 60 * 60 // 24 hours
          break
        case LotteryType.Weekly:
          endTime = startTime + 7 * 24 * 60 * 60 // 7 days
          break
        case LotteryType.Monthly:
          endTime = startTime + 30 * 24 * 60 * 60 // 30 days
          break
        default:
          throw new Error('Invalid lottery type')
      }

      const tx = await program.methods
        .initializeLottery(
          lotteryType,
          new BN(price * 1e9), // Convert to lamports
          new BN(startTime),
          new BN(endTime)
        )
        .accounts({
          authority: new PublicKey(address),
        })
        .rpc()

      toast.success('Successfully created lottery!')
      onCreated()
      setOpen(false)
    } catch (error) {
      console.error('Error creating lottery:', error)
      toast.error('Failed to create lottery')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Lottery</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Lottery</DialogTitle>
          <DialogDescription>
            Set up a new lottery with your desired parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Lottery Type</label>
            <Select
              value={lotteryType}
              onValueChange={(value: string) => setLotteryType(value as LotteryType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LotteryType.Daily}>Daily</SelectItem>
                <SelectItem value={LotteryType.Weekly}>Weekly</SelectItem>
                <SelectItem value={LotteryType.Monthly}>Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ticket Price (SOL)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={ticketPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketPrice(e.target.value)}
              placeholder="0.1"
            />
          </div>
        </div>

        <DialogFooter>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Button onClick={handleCreate}>Create Lottery</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 