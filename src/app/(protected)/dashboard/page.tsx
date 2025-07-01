'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PageContainer } from '@/components/layout/page-container'
import { useLottery } from '@/hooks/useLottery'
import { useUserDashboard } from '@/hooks/useUserDashboard'
import dynamic from 'next/dynamic'

// Dynamically import the enhanced lottery card
const EnhancedLotteryCard = dynamic(() =>
  import("@/components/lottery/enhanced-lottery-card")
    .then(mod => mod.EnhancedLotteryCard),
  {
    loading: () => (
      <div className="h-[300px] rounded border-2 border-gray-200 bg-gray-50 animate-pulse" />
    ),
    ssr: false
  }
)
import { UserTicketsTable } from '@/components/dashboard/user-tickets-table'
import { WinningsSummary } from '@/components/dashboard/winnings-summary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Dice6 } from 'lucide-react'
import { useAuthNavigation } from '@/lib/navigation'
import { formatUSDC } from '@/lib/utils'
import { useCountUp, useFadeIn, useStaggeredFadeIn } from '@/hooks/useGSAP'

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { connected, publicKey } = useWallet()
  const navigation = useAuthNavigation()
  const { lotteries, isLoading: lotteriesLoading } = useLottery()
  const { 
    userTickets, 
    userBalance, 
    userStats, 
    isLoading: userDataLoading,
    error: userDataError 
  } = useUserDashboard()
  

  // Animation refs
  const statsRef = useStaggeredFadeIn('.stat-item', 0.4)
  
  // Animated counters
  const balanceRef = useCountUp(userBalance.usdcBalance, '$', '', 1)
  const ticketsRef = useCountUp(userStats.totalTickets, '', '', 1.2)
  const netPositionRef = useCountUp(Math.abs(userBalance.netPosition), userBalance.netPosition >= 0 ? '+$' : '-$', '', 1.4)
  const winningsRef = useCountUp(userBalance.totalWinnings, '$', '', 1.6)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (isMounted && !connected) {
      navigation.toLogin('/dashboard')
    }
  }, [connected, navigation, isMounted])

  if (!isMounted) {
    return null
  }

  if (!connected) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
          <Dice6 className="h-16 w-16 text-gray-400" />
          <div className="text-center">
            <h1 className="text-2xl font-light text-gray-900 tracking-wide mb-2">
              WELCOME TO CRYPTO LOTTERY
            </h1>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-8">
              DECENTRALIZED • SOLANA
            </p>
            <p className="text-sm text-gray-600 max-w-md mb-8">
              Connect your Solana wallet to participate in decentralized lotteries and win USDC prizes
            </p>
          </div>
          <WalletMultiButton />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Pure Data Grid - Swiss Typography with Animations */}
      <div ref={statsRef} className="grid grid-cols-4 gap-16 mb-16">
        <div className="stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">USDC BALANCE</div>
          <div ref={balanceRef} className="text-3xl font-light text-gray-900 font-mono">
            {userDataLoading ? '—' : '$0.00'}
          </div>
        </div>
        <div className="stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">TOTAL TICKETS</div>
          <div ref={ticketsRef} className="text-3xl font-light text-gray-900 font-mono">
            {userDataLoading ? '—' : '0'}
          </div>
        </div>
        <div className="stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">NET POSITION</div>
          <div ref={netPositionRef} className={`text-3xl font-light font-mono ${
            userBalance.netPosition >= 0 ? 'text-gray-900' : 'text-red-600'
          }`}>
            {userDataLoading ? '—' : '+$0.00'}
          </div>
        </div>
        <div className="stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">WINNINGS</div>
          <div ref={winningsRef} className="text-3xl font-light text-gray-900 font-mono">
            {userDataLoading ? '—' : '$0.00'}
          </div>
        </div>
      </div>

      {/* Error State */}
      {userDataError && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            {userDataError instanceof Error ? userDataError.message : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {/* Clean Tabs Navigation */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 h-auto p-0 bg-transparent border-b border-gray-200">
          <TabsTrigger 
            value="overview" 
            className="text-xs uppercase tracking-wider text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent pb-4"
          >
            OVERVIEW
          </TabsTrigger>
          <TabsTrigger 
            value="tickets"
            className="text-xs uppercase tracking-wider text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent pb-4"
          >
            MY TICKETS
          </TabsTrigger>
          <TabsTrigger 
            value="winnings"
            className="text-xs uppercase tracking-wider text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent pb-4"
          >
            WINNINGS
          </TabsTrigger>
          <TabsTrigger 
            value="lotteries"
            className="text-xs uppercase tracking-wider text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent pb-4"
          >
            AVAILABLE
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-12">
          {/* Additional Stats Grid */}
          <div className="grid grid-cols-4 gap-16">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">TOTAL SPENT</div>
              <div className="text-xl font-light text-gray-600 font-mono">
                {userDataLoading ? '—' : `$${userBalance.totalSpent.toFixed(2)}`}
              </div>
              <div className="text-xs text-gray-400 mt-1">On lottery tickets</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">ACTIVE LOTTERIES</div>
              <div className="text-xl font-light text-gray-600 font-mono">
                {userDataLoading ? '—' : userStats.activeLotteries}
              </div>
              <div className="text-xs text-gray-400 mt-1">Awaiting results</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">WIN RATE</div>
              <div className="text-xl font-light text-gray-600 font-mono">
                {userDataLoading || userStats.totalTickets === 0 ? '—' : 
                  `${((userStats.wonLotteries / userStats.totalTickets) * 100).toFixed(1)}%`
                }
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {userStats.wonLotteries}/{userStats.totalTickets} tickets
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">PENDING CLAIMS</div>
              <div className="text-xl font-light text-gray-600 font-mono">
                {userDataLoading ? '—' : `$${userStats.pendingWinnings.toFixed(2)}`}
              </div>
              <div className="text-xs text-gray-400 mt-1">Ready to claim</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-4">RECENT ACTIVITY</div>
            {userTickets.length > 0 ? (
              <div className="space-y-2">
                {userTickets.slice(0, 5).map((ticket) => (
                  <div 
                    key={`${ticket.lotteryId}-${ticket.ticketId}`} 
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-gray-600">#{ticket.ticketId}</span>
                      <span className="text-sm text-gray-600 capitalize">
                        {ticket.lotteryType}
                      </span>
                      {ticket.isWinner && (
                        <span className="text-xs text-green-600 uppercase tracking-wider">WINNER</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{ticket.lotteryState}</div>
                      {ticket.isWinner && ticket.prizeAmount && (
                        <div className="text-xs text-green-600 font-mono">+${ticket.prizeAmount.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-8 text-center border border-dashed border-gray-200">
                No tickets purchased yet
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets">
          <UserTicketsTable 
            userTickets={userTickets}
            isLoading={userDataLoading}
          />
        </TabsContent>

        {/* Winnings Tab */}
        <TabsContent value="winnings">
          <WinningsSummary
            userTickets={userTickets}
            userStats={userStats}
            userBalance={userBalance}
            isLoading={userDataLoading}
          />
        </TabsContent>

        {/* Available Lotteries Tab */}
        <TabsContent value="lotteries">
          {lotteriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-[350px] rounded border-2 border-gray-200 bg-gray-50 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lotteries && lotteries.map((lottery) => (
                <EnhancedLotteryCard
                  key={lottery.address}
                  lottery={lottery}
                  onParticipate={() => {}}
                />
              ))}
              {lotteries && lotteries.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <div className="max-w-sm mx-auto">
                    <p className="text-gray-500">No lotteries available</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

    </PageContainer>
  )
}