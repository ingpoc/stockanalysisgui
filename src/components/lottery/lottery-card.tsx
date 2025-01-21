'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LotteryAccount } from '@/types/lottery'
import { useLotteryProgram } from '@/lib/solana/program'
import { useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { PublicKey, SystemProgram } from '@solana/web3.js'

interface LotteryCardProps {
  lottery: LotteryAccount
  onUpdate: () => void
}

export function LotteryCard({ lottery, onUpdate }: LotteryCardProps) {
  const { address } = useAppKitAccount()
  const program = useLotteryProgram()
  const [loading, setLoading] = useState(false)

  const buyTicket = async () => {
    if (!program || !address) return

    try {
      setLoading(true)
      const tx = await program.methods
        .buyTicket()
        .accounts({
          lottery: lottery.publicKey,
          player: new PublicKey(address),
        })
        .rpc()

      toast.success('Successfully bought ticket!')
      onUpdate()
    } catch (error) {
      console.error('Error buying ticket:', error)
      toast.error('Failed to buy ticket')
    } finally {
      setLoading(false)
    }
  }

  const drawWinner = async () => {
    if (!program || !address) return

    try {
      setLoading(true)
      const tx = await program.methods
        .drawWinner()
        .accounts({
          lottery: lottery.publicKey,
          authority: new PublicKey(address),
          winner: lottery.winner || SystemProgram.programId,
          
        })
        .rpc()

      toast.success('Successfully drew winner!')
      onUpdate()
    } catch (error) {
      console.error('Error drawing winner:', error)
      toast.error('Failed to draw winner')
    } finally {
      setLoading(false)
    }
  }

  const isActive = lottery.status === 'Active'
  const isAuthority = address && lottery.authority.toBase58() === address
  const endTime = new Date(lottery.endTime.toNumber() * 1000)
  const timeLeft = formatDistanceToNow(endTime, { addSuffix: true })
  const hasEnded = Date.now() > endTime.getTime()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Pot: {(lottery.pot.toNumber() / 1e9).toFixed(2)} SOL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <p>Ticket Price: {(lottery.ticketPrice.toNumber() / 1e9).toFixed(2)} SOL</p>
          <p>Players: {lottery.players.length}</p>
          <p>Ends {timeLeft}</p>
          {lottery.winner && (
            <p>Winner: {lottery.winner.toBase58()}</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {loading ? (
          <LoadingSpinner />
        ) : isActive && !hasEnded ? (
          <Button 
            onClick={buyTicket} 
            className="w-full"
            disabled={!address}
          >
            Buy Ticket
          </Button>
        ) : (
          isAuthority && !lottery.winner && hasEnded && (
            <Button 
              onClick={drawWinner} 
              className="w-full"
              variant="secondary"
            >
              Draw Winner
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  )
} 