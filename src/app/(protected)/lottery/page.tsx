'use client'

import { useEffect, useState } from 'react'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { LotteryInfo } from '@/types/lottery'
import { PageContainer } from '@/components/layout/page-container'
import { LotteryCard } from '@/components/lottery/lottery-card'
import { CreateLotteryDialog } from '@/components/lottery/create-lottery-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { LotteryProgram } from '@/lib/solana/program'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'

export default function LotteryPage() {
  const [lotteries, setLotteries] = useState<LotteryInfo[]>([])
  const { connection } = useConnection()
  const { isConnected, address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('solana')
  const [subscriptions, setSubscriptions] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLotteries()
    return () => {
      // Clean up subscriptions if all necessary values are present
      if (connection && walletProvider && isConnected && address) {
        const adapter = walletProvider as any // use proper adapter typing
        const program = new LotteryProgram(connection, {
          publicKey: new PublicKey(address),
          signTransaction: adapter.signTransaction.bind(adapter),
          signAllTransactions: adapter.signAllTransactions.bind(adapter),
        })
        subscriptions.forEach(sub => program.unsubscribe(sub))
      }
    }
  }, [connection, address, walletProvider, isConnected, subscriptions])

  const fetchLotteries = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if we're connected with Solana wallet
      if (!connection || !walletProvider || !isConnected || !address) {
        setError('Please connect your Solana wallet to view lotteries')
        return
      }

      const adapter = walletProvider as BaseSignerWalletAdapter
      const program = new LotteryProgram(connection, {
        publicKey: new PublicKey(address),
        signTransaction: adapter.signTransaction.bind(adapter),
        signAllTransactions: adapter.signAllTransactions.bind(adapter),
      })

      const lotteries = await program.getLotteries()
      setLotteries(lotteries)

      // Subscribe to updates for each lottery
      const newSubscriptions = await Promise.all(
        lotteries.map(lottery =>
          program.subscribeToLotteryChanges(lottery.address, (updatedLottery) => {
            setLotteries(current =>
              current.map(l =>
                l.address === updatedLottery.address ? updatedLottery : l
              )
            )
          })
        )
      )
      setSubscriptions(newSubscriptions)
    } catch (error) {
      console.error('Failed to fetch lotteries:', error)
      setError(LotteryProgram.formatError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lotteries</h1>
        <CreateLotteryDialog onSuccess={fetchLotteries} />
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
              No lotteries found. Create one to get started!
            </div>
          )}
        </div>
      )}
    </PageContainer>
  )
} 