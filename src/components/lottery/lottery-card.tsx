'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { LotteryInfo, LotteryState } from '@/types/lottery_types'
import { LotteryProgram } from '@/lib/solana/program'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Ticket, Trophy, Loader2, Clock, Coins, Sparkles, Target } from 'lucide-react'
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
  const { publicKey, wallet } = useWallet()
  const { connection } = useConnection()
  const isActive = lottery.state === 'Open'
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

      await program.buyTicket(lottery.address)
      toast.success('Ticket purchased successfully!')
      onParticipate()
    } catch (error) {
      console.error('Failed to buy tickets:', error)
      const errorMessage = handleProgramError(error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const drawDate = new Date(lottery.drawTime * 1000)
  
  // Get lottery theme colors based on type
  const getLotteryTheme = (type: string) => {
    switch (type) {
      case 'Daily':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          iconBg: 'bg-emerald-100 text-emerald-700',
          accent: 'text-emerald-600'
        }
      case 'Weekly':
        return {
          gradient: 'from-purple-500 to-indigo-600',
          iconBg: 'bg-purple-100 text-purple-700',
          accent: 'text-purple-600'
        }
      case 'Monthly':
        return {
          gradient: 'from-amber-500 to-orange-600',
          iconBg: 'bg-amber-100 text-amber-700',
          accent: 'text-amber-600'
        }
      default:
        return {
          gradient: 'from-blue-500 to-indigo-600',
          iconBg: 'bg-blue-100 text-blue-700',
          accent: 'text-blue-600'
        }
    }
  }
  
  const theme = getLotteryTheme(lottery.lotteryType)
  const progressPercentage = lottery.targetPrizePool && lottery.targetPrizePool > 0 
    ? Math.min(100, (lottery.prizePool / lottery.targetPrizePool) * 100)
    : 0

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${theme.gradient} p-6 text-white relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-2 right-2 opacity-20">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute bottom-2 left-2 opacity-10">
          <Coins className="w-12 h-12" />
        </div>
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${theme.iconBg} bg-white/20 backdrop-blur-sm`}>
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                {lottery.lotteryType}
              </CardTitle>
            </div>
            <CardDescription className="text-white/80 font-medium">
              <Clock className="w-4 h-4 inline mr-1" />
              {format(drawDate, 'MMM dd, yyyy • h:mm a')}
            </CardDescription>
          </div>
          <Badge 
            variant={isActive ? "default" : "secondary"} 
            className={`${isActive ? 'bg-white/20 text-white border-white/30' : 'bg-white/10 text-white/70'} backdrop-blur-sm font-semibold px-3 py-1`}
          >
            {lottery.state}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-6">
        {/* Prize Information */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border">
            <div className="flex items-center justify-center mb-2">
              <Ticket className={`w-5 h-5 ${theme.accent} mr-2`} />
              <p className="text-sm font-semibold text-gray-600">Ticket Price</p>
            </div>
            <p className={`text-3xl font-bold ${theme.accent}`}>
              {formatUSDCValue(lottery.ticketPrice)}
            </p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-sm font-semibold text-gray-600">Prize Pool</p>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {formatUSDCValue(lottery.prizePool)}
            </p>
            {lottery.targetPrizePool && lottery.targetPrizePool > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Target: {formatUSDCValue(lottery.targetPrizePool)}
              </p>
            )}
          </div>
        </div>

        {/* Tickets Stats */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Tickets Sold</p>
              <p className="text-xl font-bold text-indigo-600">{lottery.totalTickets}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {lottery.targetPrizePool && lottery.targetPrizePool > 0 && lottery.prizePool < lottery.targetPrizePool && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Target Progress</span>
              <span className={`text-sm font-bold ${theme.accent}`}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-500 ease-out`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {formatUSDCValue(lottery.prizePool)} of {formatUSDCValue(lottery.targetPrizePool)} target reached
            </p>
          </div>
        )}

        {/* Countdown Timer */}
        <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-600">
              {isActive ? 'Draw in' : 'Ended'}
            </span>
          </div>
          <span className={`font-bold text-lg ${isActive ? theme.accent : 'text-gray-500'}`}>
            {formatDistanceToNow(new Date(lottery.drawTime * 1000), { addSuffix: true })}
          </span>
        </div>

        {/* Winner Announcement */}
        {lottery.winningNumbers && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-100">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Winner Selected!</p>
                  <span className="font-mono text-sm text-yellow-700 truncate max-w-[120px]">
                    {lottery.createdBy}
                  </span>
                </div>
              </div>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        )}
        
        {/* Admin Controls */}
        {isAdmin && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded bg-red-100">
                <Sparkles className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-sm font-semibold text-red-800">Admin Controls</p>
            </div>
            <AdminLotteryControls 
              lottery={lottery} 
              onStateChange={onParticipate} 
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        {isActive && !isEnded && publicKey && (
          <Button 
            className={`w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg`}
            onClick={handleBuyTickets}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Ticket className="w-5 h-5 mr-3" />
                <span>Buy Ticket • {formatUSDCValue(lottery.ticketPrice)}</span>
              </>
            )}
          </Button>
        )}
        {(!isActive || isEnded || !publicKey) && (
          <div className="w-full text-center py-4">
            <p className="text-gray-500 font-medium">
              {!publicKey ? 'Connect wallet to participate' : 
               !isActive ? 'Lottery not available' : 
               'Draw period ended'}
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
} 