'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { LotteryInfo, LotteryState } from '@/types/lottery'
import { LotteryProgram } from '@/lib/solana/program'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Ticket, Trophy, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { handleProgramError, formatUSDC } from '@/lib/utils'
import { AdminLotteryControls } from './admin-lottery-controls'
import { ADMIN_WALLET } from '@/lib/constants'

interface LotteryCardProps {
  lottery: LotteryInfo
  onParticipate: () => void
}

export function LotteryCard({ lottery, onParticipate }: LotteryCardProps) {
  const [loading, setLoading] = useState(false)
  const [numberOfTickets, setNumberOfTickets] = useState(1)
  const { publicKey, wallet } = useWallet()
  const { connection } = useConnection()
  const isActive = lottery.state === LotteryState.Open
  const isEnded = new Date(lottery.drawTime * 1000) < new Date()
  const isWinner = lottery.winningNumbers && publicKey?.toBase58() === lottery.createdBy
  const isAdmin = publicKey?.toBase58() === ADMIN_WALLET

  // Helper function to format USDC values
  const formatUSDCValue = (value: number): string => {
    // USDC has 6 decimal places
    return formatUSDC(value);
  }

  const handleBuyTickets = async () => {
    if (!publicKey || !connection || !wallet) {
      toast.error('Please connect your wallet to buy tickets')
      return
    }

    try {
      setLoading(true)
      const adapter = wallet.adapter as BaseSignerWalletAdapter
      const program = new LotteryProgram(connection, {
        publicKey,
        signTransaction: adapter.signTransaction.bind(adapter),
        signAllTransactions: adapter.signAllTransactions.bind(adapter),
      })

      await program.buyTicket(lottery.address, numberOfTickets)
      toast.success('Tickets purchased successfully!')
      onParticipate()
    } catch (error) {
      console.error('Failed to buy tickets:', error)
      const errorMessage = handleProgramError(error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const isOpen = lottery.state === LotteryState.Open
  const drawDate = new Date(lottery.drawTime * 1000)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {lottery.lotteryType} Lottery
          </CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>
            {lottery.state}
          </Badge>
        </div>
        <CardDescription>
          Draw Date: {format(drawDate, 'PPp')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Ticket Price</p>
            <p className="text-2xl font-bold">{formatUSDCValue(lottery.ticketPrice)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Prize Pool</p>
            <p className="text-2xl font-bold">{formatUSDCValue(lottery.prizePool)}</p>
            {lottery.targetPrizePool && lottery.targetPrizePool > 0 && (
              <p className="text-xs text-muted-foreground">
                Target: {formatUSDCValue(lottery.targetPrizePool)}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Total Tickets</p>
          <p className="text-lg">{lottery.totalTickets}</p>
        </div>
        {lottery.targetPrizePool && lottery.targetPrizePool > 0 && lottery.prizePool < lottery.targetPrizePool && (
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${Math.min(100, (lottery.prizePool / lottery.targetPrizePool) * 100)}%` }}
            ></div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((lottery.prizePool / lottery.targetPrizePool) * 100)}% of target reached
            </p>
          </div>
        )}
        {isOpen && (
          <div className="flex gap-4">
            <Input
              type="number"
              min="1"
              value={numberOfTickets}
              onChange={(e) => setNumberOfTickets(parseInt(e.target.value))}
              className="w-24"
            />
            <Button
              onClick={handleBuyTickets}
              disabled={loading || !publicKey}
            >
              {loading ? 'Buying...' : 'Buy Tickets'}
            </Button>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {isActive ? 'Ends' : 'Ended'}
          </span>
          <span className="font-semibold">
            {formatDistanceToNow(new Date(lottery.drawTime * 1000), { addSuffix: true })}
          </span>
        </div>
        {lottery.winningNumbers && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Winner</span>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-mono text-sm truncate max-w-[120px]">
                {lottery.createdBy}
              </span>
            </div>
          </div>
        )}
        
        {/* Admin Controls */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Admin Controls</p>
            <AdminLotteryControls 
              lottery={lottery} 
              onStateChange={onParticipate} 
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {isActive && !isEnded && publicKey && (
          <Button 
            className="flex-1" 
            onClick={handleBuyTickets}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Ticket className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Buying...' : 'Buy Tickets'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 