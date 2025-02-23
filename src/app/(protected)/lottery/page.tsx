'use client'

import { useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { LotteryInfo } from '@/types/lottery'
import { PageContainer } from '@/components/layout/page-container'
import { LotteryCard } from '@/components/lottery/lottery-card'
import { CreateLotteryDialog } from '@/components/lottery/create-lottery-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { LotteryProgram } from '@/lib/solana/program'
import { InitializeProgramDialog } from '@/components/lottery/initialize-program-dialog'

export default function LotteryPage() {
  const [lotteries, setLotteries] = useState<LotteryInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { connection } = useConnection()
  const { publicKey, wallet } = useWallet()
  const [subscriptions, setSubscriptions] = useState<number[]>([])

  useEffect(() => {
    fetchLotteries()
    return () => {
      // Cleanup subscriptions on unmount
      if (connection && publicKey && wallet) {
        const adapter = wallet.adapter as BaseSignerWalletAdapter
        const program = new LotteryProgram(connection, {
          publicKey,
          signTransaction: adapter.signTransaction.bind(adapter),
          signAllTransactions: adapter.signAllTransactions.bind(adapter),
        })
        subscriptions.forEach(sub => program.unsubscribe(sub))
      }
    }
  }, [connection, publicKey, wallet])

  const fetchLotteries = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!connection || !publicKey || !wallet) {
        setError('Please connect your wallet to view lotteries')
        return
      }

      const adapter = wallet.adapter as BaseSignerWalletAdapter
      const program = new LotteryProgram(connection, {
        publicKey,
        signTransaction: adapter.signTransaction.bind(adapter),
        signAllTransactions: adapter.signAllTransactions.bind(adapter),
      })

      const lotteries = await program.getLotteries()
      console.log('Fetched lotteries:', lotteries) // Debug log
      setLotteries(lotteries)

      // Subscribe to updates for each lottery
      const newSubscriptions = await Promise.all(
        lotteries.map(async lottery => {
          try {
            return await program.subscribeToLotteryChanges(lottery.address, (updatedLottery) => {
              console.log('Lottery updated:', updatedLottery) // Debug log
              setLotteries(current =>
                current.map(l =>
                  l.address === updatedLottery.address ? updatedLottery : l
                )
              )
            })
          } catch (subError) {
            console.error('Failed to subscribe to lottery:', lottery.address, subError)
            return -1 // Return invalid subscription ID
          }
        })
      )
      setSubscriptions(newSubscriptions.filter(id => id !== -1))
    } catch (error) {
      console.error('Failed to fetch lotteries:', error)
      const errorMessage = error instanceof Error ? error.message : LotteryProgram.formatError(error)
      setError(`Failed to fetch lotteries: ${errorMessage}`)
      toast.error('Failed to fetch lotteries', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lotteries</h1>
        <div className="space-x-2">
          <InitializeProgramDialog />
          <CreateLotteryDialog onSuccess={fetchLotteries} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-[300px] rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotteries.map((lottery) => (
            <LotteryCard
              key={lottery.address}
              lottery={lottery}
              onParticipate={fetchLotteries}
            />
          ))}
          {lotteries.length === 0 && !error && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No lotteries found. Initialize the program to get started!
            </div>
          )}
        </div>
      )}
    </PageContainer>
  )
} 