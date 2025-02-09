'use client'

import { useState } from 'react'
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
import { Connection, PublicKey } from '@solana/web3.js'
import { useAppKitAccount, useAppKitProvider, useAppKit } from '@reown/appkit/react'
import { solana } from '@reown/appkit/networks'
import { useLotteryProgram } from '@/hooks/useLotteryProgram'
import { useConnection } from '@solana/wallet-adapter-react'

interface LotteryCardProps {
  lottery: LotteryInfo
  onParticipate: () => void
}

export function LotteryCard({ lottery, onParticipate }: LotteryCardProps) {
  const [loading, setLoading] = useState(false)
  const [numberOfTickets, setNumberOfTickets] = useState(1)
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('solana')
  const { open: openWallet } = useAppKit()
  const { connection } = useConnection()
  const isActive = lottery.state === LotteryState.Open
  const isEnded = new Date(lottery.drawTime * 1000) < new Date()
  const isWinner = lottery.winningNumbers && address && new PublicKey(address).toBase58() === lottery.createdBy

  const handleBuyTickets = async () => {
    if (!isConnected || !address || !walletProvider) {
      openWallet()
      return
    }

    try {
      setLoading(true)
     
      const program = useLotteryProgram()

      await program.buyTicket(lottery.address, numberOfTickets)
      toast.success('Tickets purchased successfully!')
      onParticipate()
    } catch (error) {
      console.error('Failed to buy tickets:', error)
      const errorMessage = LotteryProgram.formatError(error)
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
            <p className="text-2xl font-bold">{lottery.ticketPrice} USDC</p>
          </div>
          <div>
            <p className="text-sm font-medium">Prize Pool</p>
            <p className="text-2xl font-bold">{lottery.prizePool} USDC</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Total Tickets</p>
          <p className="text-lg">{lottery.totalTickets}</p>
        </div>
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
              disabled={loading || !isConnected}
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
      </CardContent>
      <CardFooter className="flex gap-2">
        {isActive && !isEnded && (
          <Button 
            className="flex-1" 
            onClick={handleBuyTickets}
            disabled={loading || !isConnected}
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