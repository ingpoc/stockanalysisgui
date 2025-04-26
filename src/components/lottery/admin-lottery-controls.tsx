'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { LotteryState, LotteryInfo } from '@/types/lottery'
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
import { useLottery } from '@/hooks/useLottery'

interface AdminLotteryControlsProps {
  lottery: LotteryInfo
  onStateChange: () => void
}

export function AdminLotteryControls({ lottery, onStateChange }: AdminLotteryControlsProps) {
  const [selectedState, setSelectedState] = useState<LotteryState | ''>('')
  const { connected } = useWallet()
  const {
    transitionState,
    isTransitioning
  } = useLottery()

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
      if (selectedState === LotteryState.Drawing) {
        toast.info('Transitioning to Drawing state', {
          description: 'This will use the oracle account to generate random numbers for the lottery.'
        })
      } else if (selectedState === LotteryState.Cancelled) {
        toast.info('Transitioning to Cancelled state', {
          description: 'This will use the oracle account to cancel the lottery.'
        })
      }
      
      await transitionState({ 
        lotteryAddress: lottery.address, 
        newState: selectedState 
      })
      
      setTimeout(() => {
        onStateChange()
        setSelectedState('')
      }, 1000)

    } catch (error) {
      console.error('State transition failed (UI):', error)
      setSelectedState('')
    }
  }

  const availableStates = getAvailableStates()

  if (availableStates.length === 0) {
    return <p className="text-xs text-muted-foreground">No state transitions available.</p>
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedState} onValueChange={(value) => setSelectedState(value as LotteryState)}>
        <SelectTrigger className="flex-1 text-xs h-8">
          <SelectValue placeholder="Select next state" />
        </SelectTrigger>
        <SelectContent>
          {availableStates.map((state) => (
            <SelectItem key={state} value={state} className="text-xs">
              {state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleStateTransition}
        disabled={isTransitioning || !selectedState}
        className="h-8"
      >
        {isTransitioning ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : null}
        {isTransitioning ? 'Applying...' : 'Apply'}
      </Button>
    </div>
  )
} 