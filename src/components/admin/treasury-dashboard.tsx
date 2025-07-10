'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LotteryInfo } from '@/types/lottery_types';
import { formatUSDC, formatDistanceToNow } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TreasuryDashboardProps {
  lotteries: LotteryInfo[];
  isLoading: boolean;
}

export function TreasuryDashboard({
  lotteries,
  isLoading,
}: TreasuryDashboardProps) {
  const treasuryData = useMemo(() => {
    if (!lotteries || lotteries.length === 0) {
      return {
        totalCommissions: 0,
        claimedCommissions: 0,
        pendingCommissions: 0,
        commissionsByLottery: [],
        monthlyBreakdown: [],
        claimableAmount: 0,
      };
    }

    const commissionRate = 0.02; // 2% commission
    let totalCommissions = 0;
    let claimedCommissions = 0;
    let pendingCommissions = 0;

    const commissionsByLottery = lotteries.map(lottery => {
      const revenue = lottery.totalTickets * lottery.ticketPrice;
      const commission = revenue * commissionRate;
      const isClaimable =
        typeof lottery.state === 'object' &&
        lottery.state &&
        'completed' in lottery.state;

      totalCommissions += commission;
      if (isClaimable) {
        claimedCommissions += commission;
      } else {
        pendingCommissions += commission;
      }

      return {
        lotteryId: lottery.address,
        lotteryType: lottery.lotteryType,
        state: lottery.state,
        revenue,
        commission,
        isClaimable,
        createdAt: lottery.drawTime,
        completedAt: lottery.drawTime,
      };
    });

    // Group by month for monthly breakdown
    const monthlyBreakdown = commissionsByLottery.reduce(
      (acc, item) => {
        const date = new Date(item.createdAt * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            totalCommissions: 0,
            completedCommissions: 0,
            lotteryCount: 0,
          };
        }

        acc[monthKey].totalCommissions += item.commission;
        acc[monthKey].lotteryCount += 1;

        if (item.isClaimable) {
          acc[monthKey].completedCommissions += item.commission;
        }

        return acc;
      },
      {} as Record<string, any>
    );

    const claimableAmount = commissionsByLottery
      .filter(item => item.isClaimable)
      .reduce((sum, item) => sum + item.commission, 0);

    return {
      totalCommissions,
      claimedCommissions,
      pendingCommissions,
      commissionsByLottery: commissionsByLottery.sort(
        (a, b) =>
          new Date(b.createdAt * 1000).getTime() -
          new Date(a.createdAt * 1000).getTime()
      ),
      monthlyBreakdown: Object.values(monthlyBreakdown).sort((a: any, b: any) =>
        b.month.localeCompare(a.month)
      ),
      claimableAmount,
    };
  }, [lotteries]);

  if (isLoading) {
    return (
      <div className='space-y-12'>
        <div className='grid grid-cols-3 gap-16'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='animate-pulse'>
              <div className='h-3 bg-gray-200 rounded w-3/4 mb-2'></div>
              <div className='h-8 bg-gray-200 rounded w-1/2 mb-1'></div>
              <div className='h-3 bg-gray-200 rounded w-2/3'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const commissionPercentage =
    treasuryData.totalCommissions > 0
      ? (treasuryData.claimedCommissions / treasuryData.totalCommissions) * 100
      : 0;

  return (
    <div className='space-y-12'>
      {/* Treasury Overview Grid */}
      <div className='grid grid-cols-3 gap-16'>
        <div>
          <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
            TOTAL COMMISSIONS
          </div>
          <div className='text-3xl font-light text-gray-900 font-mono'>
            {formatUSDC(treasuryData.totalCommissions)}
          </div>
          <div className='text-xs text-gray-400 mt-1'>
            {commissionPercentage.toFixed(1)}% claimed
          </div>
        </div>
        <div>
          <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
            AVAILABLE TO CLAIM
          </div>
          <div className='text-3xl font-light text-gray-900 font-mono'>
            {formatUSDC(treasuryData.claimableAmount)}
          </div>
          <div className='text-xs text-gray-400 mt-1'>
            From completed lotteries
          </div>
        </div>
        <div>
          <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
            PENDING COMMISSIONS
          </div>
          <div className='text-3xl font-light text-gray-900 font-mono'>
            {formatUSDC(treasuryData.pendingCommissions)}
          </div>
          <div className='text-xs text-gray-400 mt-1'>
            From active lotteries
          </div>
        </div>
      </div>

      {/* Claim Button */}
      {treasuryData.claimableAmount > 0 && (
        <div className='text-center'>
          <button
            className='px-6 py-2 text-xs text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200 uppercase tracking-wider'
            disabled={treasuryData.claimableAmount === 0}
          >
            Claim {formatUSDC(treasuryData.claimableAmount)}
          </button>
        </div>
      )}

      {/* Monthly Breakdown */}
      {treasuryData.monthlyBreakdown.length > 0 && (
        <div>
          <div className='text-xs text-gray-400 uppercase tracking-wider mb-8'>
            MONTHLY BREAKDOWN
          </div>
          <div className='space-y-4'>
            {treasuryData.monthlyBreakdown.slice(0, 6).map((month: any) => (
              <div
                key={month.month}
                className='flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0'
              >
                <div className='flex items-center gap-4'>
                  <span className='text-sm text-gray-600'>
                    {new Date(month.month + '-01').toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className='text-xs text-gray-400 uppercase tracking-wider'>
                    {month.lotteryCount} lotteries
                  </span>
                </div>
                <div className='text-right'>
                  <div className='text-sm font-mono text-gray-900'>
                    {formatUSDC(month.totalCommissions)}
                  </div>
                  <div className='text-xs text-gray-400'>
                    {formatUSDC(month.completedCommissions)} claimed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Details Table */}
      <div>
        <div className='text-xs text-gray-400 uppercase tracking-wider mb-8'>
          COMMISSION DETAILS BY LOTTERY
        </div>
        {treasuryData.commissionsByLottery.length === 0 ? (
          <div className='text-center py-12 text-gray-500 border border-dashed border-gray-200'>
            <p>No commission data available</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lottery ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Revenue</TableHead>
                  <TableHead className='text-right'>Commission (2%)</TableHead>
                  <TableHead>Claimable</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treasuryData.commissionsByLottery.slice(0, 10).map(item => (
                  <TableRow key={item.lotteryId}>
                    <TableCell className='font-mono text-xs'>
                      {item.lotteryId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className='capitalize'>
                      {typeof item.lotteryType === 'object' && item.lotteryType
                        ? Object.keys(item.lotteryType)[0]
                        : String(item.lotteryType)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          typeof item.state === 'object' &&
                          item.state &&
                          'completed' in item.state
                            ? 'default'
                            : 'secondary'
                        }
                        className='flex items-center gap-1 w-fit'
                      >
                        {typeof item.state === 'object' &&
                        item.state &&
                        'completed' in item.state ? (
                          <CheckCircle2 className='h-3 w-3' />
                        ) : (
                          <AlertCircle className='h-3 w-3' />
                        )}
                        <span className='capitalize'>
                          {typeof item.state === 'object' && item.state
                            ? Object.keys(item.state)[0]
                            : String(item.state)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right font-mono text-sm'>
                      {formatUSDC(item.revenue)}
                    </TableCell>
                    <TableCell className='text-right font-mono text-sm font-medium text-green-600'>
                      {formatUSDC(item.commission)}
                    </TableCell>
                    <TableCell>
                      {item.isClaimable ? (
                        <Badge className='bg-green-100 text-green-800'>
                          <CheckCircle2 className='h-3 w-3 mr-1' />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant='secondary'>
                          <AlertCircle className='h-3 w-3 mr-1' />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-sm text-gray-600'>
                      {formatDistanceToNow(new Date(item.createdAt * 1000))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
