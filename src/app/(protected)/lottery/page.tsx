'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PageContainer } from '@/components/layout/page-container'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useAuthNavigation } from '@/lib/navigation'
import { useLottery } from '@/hooks/useLottery'
import { useCountUp, useFadeIn, useStaggeredFadeIn } from '@/hooks/useGSAP'
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

  // Animation refs
  const statsRef = useStaggeredFadeIn('.lottery-stat-item', 0.4)
  const cardsRef = useStaggeredFadeIn('.lottery-card', 0.6)
  
  // Animated counters
  const activeLotteriesCount = lotteries?.filter(l => 
    typeof l.state === 'object' && l.state && 'open' in l.state
  ).length || 0
  const totalTicketsCount = lotteries?.reduce((sum, l) => sum + l.totalTickets, 0) || 0
  const totalPoolAmount = lotteries?.reduce((sum, l) => sum + l.prizePool, 0) || 0
  
  const activeRef = useCountUp(activeLotteriesCount, '', '', 1)
  const ticketsRef = useCountUp(totalTicketsCount, '', '', 1.2)
  const poolRef = useCountUp(totalPoolAmount, '$', '', 1.4)

  if (!isMounted) {
    return null
  }

  return (
    <PageContainer>
      {/* Pure Data Grid - Swiss Typography with Animations */}
      <div ref={statsRef} className="grid grid-cols-3 gap-16 mb-16">
        <div className="lottery-stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">ACTIVE</div>
          <div ref={activeRef} className="text-3xl font-light text-gray-900 font-mono">
            0
          </div>
        </div>
        <div className="lottery-stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">TICKETS</div>
          <div ref={ticketsRef} className="text-3xl font-light text-gray-900 font-mono">
            0
          </div>
        </div>
        <div className="lottery-stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">POOL</div>
          <div ref={poolRef} className="text-3xl font-light text-gray-900 font-mono">
            $0.00
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[350px] rounded border-2 border-gray-200 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {lotteries && lotteries.map((lottery) => (
            <div key={lottery.address} className="lottery-card">
              <EnhancedLotteryCard
                lottery={lottery}
                onParticipate={handleLotteryRefresh}
              />
            </div>
          ))}
          {lotteries && lotteries.length === 0 && !error && (
            <div className="col-span-full text-center py-20">
              <div className="max-w-sm mx-auto">
                <p className="text-gray-500">No lotteries found</p>
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  )
}