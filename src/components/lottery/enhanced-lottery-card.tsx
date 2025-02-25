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
import { Ticket, Trophy, Loader2, Calendar, DollarSign, Users, Clock, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { handleProgramError, formatUSDC } from '@/lib/utils'
import { AdminLotteryControls } from './admin-lottery-controls'
import { ADMIN_WALLET } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface LotteryCardProps {
  lottery: LotteryInfo
  onParticipate: () => void
}

export function EnhancedLotteryCard({ lottery, onParticipate }: LotteryCardProps) {
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
  
  // Calculate progress percentage
  const progressPercentage = lottery.targetPrizePool && lottery.targetPrizePool > 0 
    ? Math.min(100, (lottery.prizePool / lottery.targetPrizePool) * 100)
    : 0;
    
  // Get badge variant based on lottery state
  const getBadgeVariant = () => {
    switch(lottery.state) {
      case LotteryState.Open:
        return "success" as const;
      case LotteryState.Created:
        return "secondary" as const;
      case LotteryState.Drawing:
        return "default" as const;
      case LotteryState.Completed:
        return "default" as const;
      case LotteryState.Expired:
      case LotteryState.Cancelled:
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg border-2",
      isActive ? "border-primary/20" : "border-muted"
    )}>
      <div className={cn(
        "h-2 w-full",
        isActive ? "bg-green-500" : 
        lottery.state === LotteryState.Completed ? "bg-blue-500" :
        lottery.state === LotteryState.Drawing ? "bg-amber-500" :
        "bg-gray-300"
      )}></div>
      
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {lottery.lotteryType} Lottery
          </CardTitle>
          <Badge variant={getBadgeVariant()} className="px-3 py-1 text-xs font-medium">
            {lottery.state}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 text-sm">
          <Calendar className="h-4 w-4" />
          Draw: {format(drawDate, 'PPp')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5 pt-2">
        {/* Price and Prize Pool */}
        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Ticket Price
            </p>
            <p className="text-2xl font-bold text-primary">{formatUSDCValue(lottery.ticketPrice)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Trophy className="h-3 w-3" /> Prize Pool
            </p>
            <p className="text-2xl font-bold text-primary">{formatUSDCValue(lottery.prizePool)}</p>
            {lottery.targetPrizePool && lottery.targetPrizePool > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowRight className="h-3 w-3" /> Target: {formatUSDCValue(lottery.targetPrizePool)}
              </p>
            )}
          </div>
        </div>
        
        {/* Tickets */}
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
            <Users className="h-3 w-3" /> Total Tickets
          </p>
          <p className="text-lg font-bold">{lottery.totalTickets}</p>
        </div>
        
        {/* Progress Bar */}
        {lottery.targetPrizePool && lottery.targetPrizePool > 0 && (
          <div className="space-y-1">
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className={cn(
                  "h-3 rounded-full transition-all duration-500",
                  progressPercentage > 75 ? "bg-green-500" : 
                  progressPercentage > 50 ? "bg-blue-500" : 
                  progressPercentage > 25 ? "bg-amber-500" : "bg-primary"
                )}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{Math.round(progressPercentage)}% of target</span>
              <span>{formatUSDCValue(lottery.prizePool)} / {formatUSDCValue(lottery.targetPrizePool)}</span>
            </div>
          </div>
        )}
        
        {/* Time Remaining */}
        <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {isActive ? 'Ends' : 'Ended'}
          </span>
          <span className="font-semibold text-sm">
            {formatDistanceToNow(new Date(lottery.drawTime * 1000), { addSuffix: true })}
          </span>
        </div>
        
        {/* Winner Section */}
        {lottery.winningNumbers && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Winner</span>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="font-mono text-sm truncate max-w-[120px] text-amber-700 dark:text-amber-300">
                {lottery.createdBy.slice(0, 6)}...{lottery.createdBy.slice(-4)}
              </span>
            </div>
          </div>
        )}
        
        {/* Buy Tickets Input */}
        {isOpen && (
          <div className="flex gap-2 mt-4">
            <div className="flex items-center bg-muted/50 rounded-md px-2">
              <span className="text-sm text-muted-foreground mr-2">Qty:</span>
              <Input
                type="number"
                min="1"
                value={numberOfTickets}
                onChange={(e) => setNumberOfTickets(parseInt(e.target.value) || 1)}
                className="w-16 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-center"
              />
            </div>
            <Button
              onClick={handleBuyTickets}
              disabled={loading || !publicKey}
              className="flex-1 bg-primary hover:bg-primary/90"
              size="sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Ticket className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Buying...' : 'Buy Tickets'}
            </Button>
          </div>
        )}
        
        {/* Admin Controls */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-dashed border-muted">
            <p className="text-sm font-medium mb-2 text-primary">Admin Controls</p>
            <AdminLotteryControls 
              lottery={lottery} 
              onStateChange={onParticipate} 
            />
          </div>
        )}
      </CardContent>
      
      {isActive && !isEnded && publicKey && !isOpen && (
        <CardFooter className="pt-0">
          <Button 
            className="w-full" 
            onClick={handleBuyTickets}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Ticket className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Buying...' : 'Buy Tickets'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 