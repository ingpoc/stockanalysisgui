'use client'

import { useEffect, useState, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { LotteryInfo } from '@/types/lottery'
import { PageContainer } from '@/components/layout/page-container'
import { EnhancedLotteryCard } from '@/components/lottery/enhanced-lottery-card'
import { CreateLotteryDialog } from '@/components/lottery/create-lottery-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { LotteryProgram } from '@/lib/solana/program'
import { InitializeProgramDialog } from '@/components/lottery/initialize-program-dialog'
import { useLotterySubscriptions } from '@/hooks/use-lottery-subscriptions'
import { useAuthNavigation } from '@/lib/navigation'

export default function LotteryPage() {
  const [lotteries, setLotteries] = useState<LotteryInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { connection } = useConnection()
  const { publicKey, wallet, connected } = useWallet()
  const navigation = useAuthNavigation()
  const { subscribe, unsubscribeAll, isReady } = useLotterySubscriptions()

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Handle wallet disconnection
  useEffect(() => {
    if (isMounted && !connected) {
      navigation.toLogin('/lottery')
    }
  }, [connected, navigation, isMounted])

  const fetchLotteries = useCallback(async () => {
    if (!isMounted || !connection || !publicKey || !wallet) {
      setError('Please connect your wallet to view lotteries')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const adapter = wallet.adapter as BaseSignerWalletAdapter
      const program = new LotteryProgram(connection, {
        publicKey,
        signTransaction: adapter.signTransaction.bind(adapter),
        signAllTransactions: adapter.signAllTransactions.bind(adapter),
      })

      // Check if the program is initialized
      const isInitialized = await program.isProgramInitialized()
      if (!isInitialized) {
        if (isMounted) {
          setError('Program not initialized. Please initialize the program first.')
          setLotteries([])
          setLoading(false)
        }
        return
      }

      const fetchedLotteries = await program.getLotteries()
      console.log('Fetched lotteries:', fetchedLotteries)
      
      if (isMounted) {
        setLotteries(fetchedLotteries)
        
        // Use a more efficient way to subscribe to updates
        // Only subscribe if not already subscribed
        const lotteryAddresses = new Set(fetchedLotteries.map(l => l.address))
        
        // Subscribe to updates for each lottery
        for (const lottery of fetchedLotteries) {
          if (isMounted) {
            await subscribe(lottery.address, (updatedLottery) => {
              if (isMounted) {
                console.log('Lottery updated:', updatedLottery)
                setLotteries(current =>
                  current.map(l =>
                    l.address === updatedLottery.address ? updatedLottery : l
                  )
                )
              }
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch lotteries:', error)
      const errorMessage = error instanceof Error ? error.message : LotteryProgram.formatError(error)
      if (isMounted) {
        setError(`Failed to fetch lotteries: ${errorMessage}`)
        toast.error('Failed to fetch lotteries', {
          description: errorMessage
        })
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }, [connection, publicKey, wallet, isMounted, subscribe])

  // Fetch lotteries when wallet is connected
  useEffect(() => {
    if (isMounted && connected && isReady) {
      fetchLotteries()
    }
    
    // Clean up subscriptions when component unmounts
    return () => {
      if (isMounted) {
        unsubscribeAll()
      }
    }
  }, [isMounted, connected, isReady, fetchLotteries, unsubscribeAll])

  // Handle lottery refresh
  const handleLotteryRefresh = useCallback(() => {
    if (isMounted && connected) {
      fetchLotteries()
    }
  }, [isMounted, connected, fetchLotteries])

  // Don't render anything until mounted
  if (!isMounted) {
    return null
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
            <EnhancedLotteryCard
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