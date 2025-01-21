'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { LotteryInfo, LotteryStatus } from '@/types/lottery'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ticket, Trophy } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { LotteryProgram } from '@/lib/solana/program'
import { useConnection } from '@solana/wallet-adapter-react'
import { handleProgramError } from '@/lib/utils'

interface LotteryCardProps {
  lottery: LotteryInfo
  onParticipate: () => void
}

export function LotteryCard({ lottery, onParticipate }: LotteryCardProps) {
  const { publicKey, wallet } = useWallet()
  const { connection } = useConnection()
  const isActive = lottery.status === LotteryStatus.Active
  const isEnded = new Date(lottery.endTime * 1000) < new Date()
  const isWinner = lottery.winner === publicKey?.toBase58()

  const handleBuyTicket = async () => {
    if (!publicKey || !connection) return

    try {
      const adapter = wallet?.adapter as BaseSignerWalletAdapter
      if (!adapter) return

      const program = new LotteryProgram(connection, {
        publicKey,
        signTransaction: adapter.signTransaction.bind(adapter),
        signAllTransactions: adapter.signAllTransactions.bind(adapter),
      })

      await program.buyTicket(new PublicKey(lottery.address))
      toast.success('Ticket purchased successfully!')
      onParticipate()
    } catch (error) {
      console.error('Failed to buy ticket:', error)
      toast.error(handleProgramError(error))
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {lottery.type} Lottery
          </CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>
            {lottery.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Pot Size</span>
          <span className="font-semibold">
            {(lottery.pot / LAMPORTS_PER_SOL).toFixed(2)} SOL
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Ticket Price</span>
          <span className="font-semibold">
            {(lottery.ticketPrice / LAMPORTS_PER_SOL).toFixed(2)} SOL
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Players</span>
          <span className="font-semibold">{lottery.playerCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {isActive ? 'Ends' : 'Ended'}
          </span>
          <span className="font-semibold">
            {isActive 
              ? formatDistanceToNow(new Date(lottery.endTime * 1000), { addSuffix: true })
              : formatDistanceToNow(new Date(lottery.endTime * 1000), { addSuffix: true })
            }
          </span>
        </div>
        {lottery.winner && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Winner</span>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-mono text-sm truncate max-w-[120px]">
                {lottery.winner}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isActive && !isEnded && publicKey && (
          <Button 
            className="w-full" 
            onClick={handleBuyTicket}
          >
            <Ticket className="w-4 h-4 mr-2" />
            Buy Ticket
          </Button>
        )}
        {isWinner && (
          <Badge variant="success" className="w-full justify-center py-2">
            <Trophy className="w-4 h-4 mr-2" />
            You Won!
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
} 