'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { LotteryState, LotteryInfo } from '@/types/lottery_types'
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
  const [selectedState, setSelectedState] = useState<string>('')
  const { connected } = useWallet()
  const {
    transitionState,
    isTransitioning
  } = useLottery()

  // Map capitalized states to the correct format for useLottery hook
  const mapStateToEnum = (state: string): LotteryState => {
    return state as unknown as LotteryState
  }

  const getAvailableStates = () => {
    // Extract state key from discriminated union
    const stateKey = typeof lottery.state === 'object' && lottery.state 
      ? Object.keys(lottery.state)[0] 
      : String(lottery.state)
    
    // These MUST match the smart contract's can_transition_to method
    switch (stateKey.toLowerCase()) {
      case 'created':
        return ['Open', 'Cancelled']
      case 'open':
        return ['Locked', 'Cancelled']  // Smart contract does NOT allow Open → Drawing
      case 'locked':
        return ['Drawing', 'Cancelled']
      case 'drawing':
        return ['AwaitingRandomness', 'Expired', 'Cancelled']
      case 'awaitingrandomness':
        return ['Completed', 'Expired', 'Cancelled']
      case 'completed':
      case 'expired':
      case 'cancelled':
        return []  // Terminal states
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
      if (selectedState === 'Drawing') {
        toast.info('Transitioning to Drawing state', {
          description: 'This will use the oracle account to generate random numbers for the lottery.'
        })
      } else if (selectedState === 'Cancelled') {
        toast.info('Transitioning to Cancelled state', {
          description: 'This will use the oracle account to cancel the lottery.'
        })
      }
      
      await transitionState({ 
        lotteryAddress: lottery.address, 
        newState: mapStateToEnum(selectedState)
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
      <Select value={selectedState} onValueChange={(value) => setSelectedState(value as string)}>
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