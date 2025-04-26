'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PageContainer } from '@/components/layout/page-container'
import { CreateLotteryDialog } from '@/components/lottery/create-lottery-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { InitializeProgramDialog } from '@/components/lottery/initialize-program-dialog'
import { useAuthNavigation } from '@/lib/navigation'
import { useLottery } from '@/hooks/useLottery'
import dynamic from 'next/dynamic'

// Dynamically import the main lottery card
const EnhancedLotteryCard = dynamic(() => 
  import("@/components/lottery/enhanced-lottery-card")
    .then(mod => mod.EnhancedLotteryCard),
  {
    loading: () => (
      <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
    ),
    ssr: false
  }
)

export default function LotteryPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { connected } = useWallet()
  const navigation = useAuthNavigation()
  const { 
    lotteries, 
    isLoading, 
    error 
  } = useLottery()

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (isMounted && !connected) {
      navigation.toLogin('/lottery')
    }
  }, [connected, navigation, isMounted])

  const handleLotteryRefresh = useCallback(() => {
    console.log("Refresh triggered - relying on hook invalidation.")
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lotteries</h1>
        <div className="space-x-2">
          <InitializeProgramDialog />
          <CreateLotteryDialog onSuccess={handleLotteryRefresh} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Lotteries</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'An unknown error occurred'}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
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
          {lotteries && lotteries.map((lottery) => (
            <EnhancedLotteryCard
              key={lottery.address}
              lottery={lottery}
              onParticipate={handleLotteryRefresh}
            />
          ))}
          {lotteries && lotteries.length === 0 && !error && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No lotteries found. Initialize the program or create one!
            </div>
          )}
        </div>
      )}
    </PageContainer>
  )
} 