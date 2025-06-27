'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUSDC } from '@/lib/utils'
import { 
  Wallet, 
  Ticket, 
  Trophy, 
  Clock,
  TrendingUp,
  DollarSign,
  Target,
  Gift
} from 'lucide-react'

interface UserStatsProps {
  userBalance: {
    usdcBalance: number
    totalSpent: number
    totalWinnings: number
    netPosition: number
  }
  userStats: {
    totalTickets: number
    activeLotteries: number
    completedLotteries: number
    wonLotteries: number
    pendingWinnings: number
  }
  isLoading: boolean
}

export function UserStats({ userBalance, userStats, isLoading }: UserStatsProps) {
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
      title: 'USDC Balance',
      value: formatUSDC(userBalance.usdcBalance),
      icon: Wallet,
      description: 'Available in wallet',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Net Position',
      value: formatUSDC(Math.abs(userBalance.netPosition)),
      icon: userBalance.netPosition >= 0 ? TrendingUp : DollarSign,
      description: userBalance.netPosition >= 0 ? 'Total profit' : 'Total loss',
      color: userBalance.netPosition >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: userBalance.netPosition >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Total Tickets',
      value: userStats.totalTickets.toString(),
      icon: Ticket,
      description: `${userStats.activeLotteries} active`,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Winnings',
      value: formatUSDC(userBalance.totalWinnings),
      icon: Trophy,
      description: `${userStats.wonLotteries} lotteries won`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Total Spent',
      value: formatUSDC(userBalance.totalSpent),
      icon: Target,
      description: 'On lottery tickets',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Claims',
      value: formatUSDC(userStats.pendingWinnings),
      icon: Gift,
      description: 'Ready to claim',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Active Lotteries',
      value: userStats.activeLotteries.toString(),
      icon: Clock,
      description: 'Awaiting results',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Win Rate',
      value: userStats.totalTickets > 0 
        ? `${((userStats.wonLotteries / userStats.totalTickets) * 100).toFixed(1)}%` 
        : '0%',
      icon: Trophy,
      description: `${userStats.wonLotteries}/${userStats.totalTickets} tickets`,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    }
  ]

  return (
    <div className="mb-8">
      <h2 className="text-xl font-light text-gray-900 mb-6 tracking-wide">YOUR OVERVIEW</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, index) => {
          const IconComponent = item.icon
          return (
            <Card key={index} className="border-gray-200 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {item.title}
                  </span>
                  <div className={`p-2 rounded-full ${item.bgColor}`}>
                    <IconComponent className={`h-4 w-4 ${item.color}`} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light text-gray-900 mb-1">
                  {item.value}
                </div>
                <p className="text-xs text-gray-500">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}