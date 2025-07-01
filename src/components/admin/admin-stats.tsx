'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, Trophy, Clock, TrendingUp, Activity } from 'lucide-react'
import { LotteryInfo } from '@/types/lottery_types'
import { formatUSDC } from '@/lib/utils'
import { useCountUp, useStaggeredFadeIn } from '@/hooks/useGSAP'

interface AdminStatsProps {
  lotteries: LotteryInfo[]
  isLoading: boolean
}

export function AdminStats({ lotteries, isLoading }: AdminStatsProps) {
  const stats = useMemo(() => {
    if (!lotteries || lotteries.length === 0) {
      return {
        totalLotteries: 0,
        totalTicketsSold: 0,
        totalPrizePool: 0,
        totalCommissions: 0,
        activeLotteries: 0,
        completedLotteries: 0,
        avgTicketsPerLottery: 0,
        totalRevenue: 0
      }
    }

    const totalTicketsSold = lotteries.reduce((sum, lottery) => sum + lottery.totalTickets, 0)
    const totalPrizePool = lotteries.reduce((sum, lottery) => sum + lottery.prizePool, 0)
    const activeLotteries = lotteries.filter(l => {
      const stateKey = typeof l.state === 'object' && l.state 
        ? Object.keys(l.state)[0] 
        : String(l.state)
      return ['open', 'locked'].includes(stateKey.toLowerCase())
    }).length
    
    const completedLotteries = lotteries.filter(l => {
      const stateKey = typeof l.state === 'object' && l.state 
        ? Object.keys(l.state)[0] 
        : String(l.state)
      return stateKey.toLowerCase() === 'completed'
    }).length
    
    // Calculate total commissions (assuming 2% fee rate)
    const totalRevenue = lotteries.reduce((sum, lottery) => 
      sum + (lottery.totalTickets * lottery.ticketPrice), 0
    )
    const totalCommissions = totalRevenue * 0.02 // 2% commission

    return {
      totalLotteries: lotteries.length,
      totalTicketsSold,
      totalPrizePool,
      totalCommissions,
      activeLotteries,
      completedLotteries,
      avgTicketsPerLottery: lotteries.length > 0 ? totalTicketsSold / lotteries.length : 0,
      totalRevenue
    }
  }, [lotteries])

  // Animation refs
  const statsRef = useStaggeredFadeIn('.admin-stat-item', 0.3)
  
  // Animated counters
  const lotteriesRef = useCountUp(stats.totalLotteries, '', '', 1)
  const revenueRef = useCountUp(stats.totalRevenue, '$', '', 1.2)
  const commissionsRef = useCountUp(stats.totalCommissions, '$', '', 1.4)
  const ticketsRef = useCountUp(stats.totalTicketsSold, '', '', 1.6)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statItems = [
    {
      title: 'Total Lotteries',
      value: stats.totalLotteries.toString(),
      icon: Activity,
      description: `${stats.activeLotteries} active, ${stats.completedLotteries} completed`,
      color: 'text-blue-600'
    },
    {
      title: 'Total Revenue',
      value: formatUSDC(stats.totalRevenue),
      icon: DollarSign,
      description: 'Gross ticket sales',
      color: 'text-green-600'
    },
    {
      title: 'Commission Earned',
      value: formatUSDC(stats.totalCommissions),
      icon: TrendingUp,
      description: '2% of total revenue',
      color: 'text-purple-600'
    },
    {
      title: 'Prize Pool',
      value: formatUSDC(stats.totalPrizePool),
      icon: Trophy,
      description: 'Current total in prizes',
      color: 'text-yellow-600'
    },
    {
      title: 'Tickets Sold',
      value: stats.totalTicketsSold.toLocaleString(),
      icon: Users,
      description: `Avg ${stats.avgTicketsPerLottery.toFixed(1)} per lottery`,
      color: 'text-indigo-600'
    },
    {
      title: 'Active Lotteries',
      value: stats.activeLotteries.toString(),
      icon: Clock,
      description: 'Currently accepting tickets',
      color: 'text-emerald-600'
    },
    {
      title: 'Completed',
      value: stats.completedLotteries.toString(),
      icon: Trophy,
      description: 'Winners selected',
      color: 'text-amber-600'
    },
    {
      title: 'Avg Participation',
      value: stats.avgTicketsPerLottery.toFixed(1),
      icon: TrendingUp,
      description: 'Tickets per lottery',
      color: 'text-rose-600'
    }
  ]

  return (
    <div className="mb-16">
      {/* Pure Data Grid - Swiss Typography with Animations */}
      <div ref={statsRef} className="grid grid-cols-4 gap-16 pt-8">
        <div className="admin-stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">TOTAL LOTTERIES</div>
          <div ref={lotteriesRef} className="text-3xl font-light text-gray-900 font-mono">
            0
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.activeLotteries} active, {stats.completedLotteries} completed
          </div>
        </div>
        <div className="admin-stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">TOTAL REVENUE</div>
          <div ref={revenueRef} className="text-3xl font-light text-gray-900 font-mono">
            $0.00
          </div>
          <div className="text-xs text-gray-400 mt-1">Gross ticket sales</div>
        </div>
        <div className="admin-stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">COMMISSION EARNED</div>
          <div ref={commissionsRef} className="text-3xl font-light text-gray-900 font-mono">
            $0.00
          </div>
          <div className="text-xs text-gray-400 mt-1">2% of total revenue</div>
        </div>
        <div className="admin-stat-item">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">TICKETS SOLD</div>
          <div ref={ticketsRef} className="text-3xl font-light text-gray-900 font-mono">
            0
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Avg {stats.avgTicketsPerLottery.toFixed(1)} per lottery
          </div>
        </div>
      </div>
      
      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-4 gap-16 pt-12">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">PRIZE POOL</div>
          <div className="text-xl font-light text-gray-600 font-mono">
            {formatUSDC(stats.totalPrizePool)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Current total in prizes</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">ACTIVE LOTTERIES</div>
          <div className="text-xl font-light text-gray-600 font-mono">
            {stats.activeLotteries}
          </div>
          <div className="text-xs text-gray-400 mt-1">Currently accepting tickets</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">COMPLETED</div>
          <div className="text-xl font-light text-gray-600 font-mono">
            {stats.completedLotteries}
          </div>
          <div className="text-xs text-gray-400 mt-1">Winners selected</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">AVG PARTICIPATION</div>
          <div className="text-xl font-light text-gray-600 font-mono">
            {stats.avgTicketsPerLottery.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Tickets per lottery</div>
        </div>
      </div>
    </div>
  )
}