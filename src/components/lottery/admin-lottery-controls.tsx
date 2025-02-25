'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { LotteryState, LotteryInfo } from '@/types/lottery'
import { useLotteryProgram } from '@/hooks/use-lottery-program'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { handleProgramError, formatUSDC } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface AdminLotteryControlsProps {
  lottery: LotteryInfo
  onStateChange: () => void
}

export function AdminLotteryControls({ lottery, onStateChange }: AdminLotteryControlsProps) {
  const [loading, setLoading] = useState(false)
  const [selectedState, setSelectedState] = useState<LotteryState | ''>('')
  const { connected } = useWallet()
  const program = useLotteryProgram()

  // Get available next states based on current state
  const getAvailableStates = () => {
    switch (lottery.state) {
      case LotteryState.Created:
        return [LotteryState.Open, LotteryState.Cancelled]
      case LotteryState.Open:
        return [LotteryState.Drawing, LotteryState.Cancelled]
      case LotteryState.Drawing:
        return [LotteryState.Completed, LotteryState.Expired]
      default:
        return []
    }
  }

  const handleStateTransition = async () => {
    if (!connected || !selectedState) {
      toast.error('Please connect your wallet and select a state')
      return
    }

    try {
      setLoading(true)
      const lotteryPubkey = new PublicKey(lottery.address)
      
      // Show a specific message for Drawing state transition
      if (selectedState === LotteryState.Drawing) {
        toast.info('Transitioning to Drawing state', {
          description: 'This will use the oracle account to generate random numbers for the lottery.'
        })
      }
      // Show a specific message for Cancelled state transition
      else if (selectedState === LotteryState.Cancelled) {
        toast.info('Transitioning to Cancelled state', {
          description: 'This will use the oracle account to cancel the lottery.'
        })
      }
      
      await program.transitionState(lotteryPubkey, selectedState)
      toast.success('State transition successful')
      
      // Add a slight delay before refreshing the UI to allow account data to propagate
      setTimeout(() => {
        onStateChange()
        setLoading(false)
        setSelectedState('')
      }, 2000) // 2 second delay
    } catch (error) {
      console.error('State transition failed:', error)
      const errorMessage = handleProgramError(error)
      toast.error('State transition failed', {
        description: errorMessage
      })
      setLoading(false)
      setSelectedState('')
    }
  }

  const availableStates = getAvailableStates()

  if (availableStates.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedState}
        onValueChange={(value) => setSelectedState(value as LotteryState)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select new state" />
        </SelectTrigger>
        <SelectContent>
          {availableStates.map((state) => (
            <SelectItem key={state} value={state}>
              {state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleStateTransition}
        disabled={loading || !selectedState || !connected}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transitioning...
          </>
        ) : (
          'Transition State'
        )}
      </Button>
    </div>
  )
} 