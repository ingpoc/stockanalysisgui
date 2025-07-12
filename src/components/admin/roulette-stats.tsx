'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  Users,
  Trophy,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { RouletteDisplay } from '@/types/roulette-runtime-types';
import { formatUSDC } from '@/lib/utils';
// import { useCountUp, useStaggeredFadeIn } from '@/hooks/useGSAP';

interface RouletteStatsProps {
  roulettes: RouletteDisplay[];
  isLoading: boolean;
}

export function RouletteStats({ roulettes, isLoading }: RouletteStatsProps) {
  const stats = useMemo(() => {
    if (!roulettes || roulettes.length === 0) {
      return {
        totalGames: 0,
        totalBets: 0,
        totalBetAmount: 0,
        totalPlayers: 0,
        activeGames: 0,
        completedGames: 0,
        totalPayouts: 0,
        houseEdge: 0,
      };
    }

    const totalGames = roulettes.length;
    const totalBets = roulettes.reduce((sum, r) => sum + r.totalBets, 0);
    const totalBetAmount = roulettes.reduce((sum, r) => sum + r.totalBetAmount, 0);
    const totalPlayers = roulettes.reduce((sum, r) => sum + r.totalPlayers, 0);
    const totalPayouts = roulettes.reduce((sum, r) => sum + r.totalPayouts, 0);
    const houseEdge = roulettes.reduce((sum, r) => sum + r.houseEdgeCollected, 0);

    // Count active games
    const activeGames = roulettes.filter(r => {
      const state = typeof r.state === 'object' ? Object.keys(r.state)[0] : r.state;
      return ['open', 'locked', 'spinning', 'awaitingRandomness'].includes(state?.toLowerCase() || '');
    }).length;

    // Count completed games
    const completedGames = roulettes.filter(r => {
      const state = typeof r.state === 'object' ? Object.keys(r.state)[0] : r.state;
      return ['completed', 'expired'].includes(state?.toLowerCase() || '');
    }).length;

    return {
      totalGames,
      totalBets,
      totalBetAmount,
      totalPlayers,
      activeGames,
      completedGames,
      totalPayouts,
      houseEdge,
    };
  }, [roulettes]);

  // const containerRef = useStaggeredFadeIn('.stat-card');

  // const totalGamesCount = useCountUp(stats.totalGames);
  // const totalBetsCount = useCountUp(stats.totalBets);
  // const totalBetAmountCount = useCountUp(stats.totalBetAmount);
  // const totalPlayersCount = useCountUp(stats.totalPlayers);
  // const activeGamesCount = useCountUp(stats.activeGames);
  // const completedGamesCount = useCountUp(stats.completedGames);

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                <div className='h-4 bg-gray-200 rounded w-20'></div>
              </CardTitle>
              <div className='h-4 w-4 bg-gray-200 rounded'></div>
            </CardHeader>
            <CardContent>
              <div className='h-8 bg-gray-200 rounded w-16 mb-1'></div>
              <div className='h-3 bg-gray-200 rounded w-24'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    >
      <Card className="stat-card">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Games</CardTitle>
          <Activity className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalGames}</div>
          <p className='text-xs text-muted-foreground'>
            {stats.activeGames} active, {stats.completedGames} completed
          </p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Bets</CardTitle>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalBets}</div>
          <p className='text-xs text-muted-foreground'>
            Across all games
          </p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Wagered</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {formatUSDC(stats.totalBetAmount)}
          </div>
          <p className='text-xs text-muted-foreground'>
            Total bet amount
          </p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Players</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalPlayers}</div>
          <p className='text-xs text-muted-foreground'>
            Unique participants
          </p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Active Games</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.activeGames}</div>
          <p className='text-xs text-muted-foreground'>
            Currently running
          </p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Payouts</CardTitle>
          <Trophy className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {formatUSDC(stats.totalPayouts)}
          </div>
          <p className='text-xs text-muted-foreground'>
            Winner rewards
          </p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>House Edge</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {formatUSDC(stats.houseEdge)}
          </div>
          <p className='text-xs text-muted-foreground'>
            Platform revenue
          </p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Win Rate</CardTitle>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {stats.totalBetAmount > 0 
              ? `${((stats.totalPayouts / stats.totalBetAmount) * 100).toFixed(1)}%`
              : '0%'
            }
          </div>
          <p className='text-xs text-muted-foreground'>
            Payout ratio
          </p>
        </CardContent>
      </Card>
    </div>
  );
}