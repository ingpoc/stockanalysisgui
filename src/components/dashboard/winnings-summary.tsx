'use client';

import { formatUSDC, formatDistanceToNow } from '@/lib/utils';

interface UserTicket {
  ticketId: number;
  lotteryId: string;
  lotteryType: string;
  ticketPrice: number;
  purchasedAt: Date;
  lotteryState: string;
  isWinner: boolean;
  prizeAmount?: number;
  drawTime: Date;
}

interface WinningsSummaryProps {
  userTickets: UserTicket[];
  userStats: {
    totalTickets: number;
    activeLotteries: number;
    completedLotteries: number;
    wonLotteries: number;
    pendingWinnings: number;
  };
  userBalance: {
    usdcBalance: number;
    totalSpent: number;
    totalWinnings: number;
    netPosition: number;
  };
  isLoading: boolean;
}

export function WinningsSummary({
  userTickets,
  userStats,
  userBalance,
  isLoading,
}: WinningsSummaryProps) {
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

  const winningTickets = userTickets.filter(ticket => ticket.isWinner);
  const claimableWinnings = winningTickets.filter(
    ticket => ticket.lotteryState === 'Completed' && ticket.prizeAmount
  );

  return (
    <div className='space-y-12'>
      {/* Winnings Overview - Clean Grid */}
      <div>
        <div className='text-xs text-gray-400 uppercase tracking-wider mb-8'>
          WINNINGS OVERVIEW
        </div>
        <div className='grid grid-cols-3 gap-16'>
          <div>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
              TOTAL WINNINGS
            </div>
            <div className='text-3xl font-light text-gray-900 font-mono'>
              {formatUSDC(userBalance.totalWinnings)}
            </div>
            <div className='text-xs text-gray-400 mt-1'>
              From {userStats.wonLotteries} winning tickets
            </div>
          </div>
          <div>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
              PENDING CLAIMS
            </div>
            <div className='text-3xl font-light text-gray-900 font-mono'>
              {formatUSDC(userStats.pendingWinnings)}
            </div>
            <div className='text-xs text-gray-400 mt-1'>Ready to claim</div>
          </div>
          <div>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
              NET POSITION
            </div>
            <div
              className={`text-3xl font-light font-mono ${
                userBalance.netPosition >= 0 ? 'text-gray-900' : 'text-red-600'
              }`}
            >
              {userBalance.netPosition >= 0 ? '+' : ''}
              {formatUSDC(Math.abs(userBalance.netPosition))}
            </div>
            <div className='text-xs text-gray-400 mt-1'>Winnings - Spent</div>
          </div>
        </div>

        {/* Claim All Button */}
        {claimableWinnings.length > 0 && (
          <div className='text-center mt-12'>
            <button className='px-6 py-2 text-xs text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200 uppercase tracking-wider'>
              Claim All Winnings ({formatUSDC(userStats.pendingWinnings)})
            </button>
            <p className='text-xs text-gray-400 mt-2 uppercase tracking-wider'>
              Claim all pending winnings to your wallet
            </p>
          </div>
        )}
      </div>

      {/* Recent Winnings */}
      {winningTickets.length > 0 && (
        <div>
          <div className='text-xs text-gray-400 uppercase tracking-wider mb-8'>
            RECENT WINNINGS
          </div>
          <div className='space-y-4'>
            {winningTickets.slice(0, 5).map(ticket => (
              <div
                key={`${ticket.lotteryId}-${ticket.ticketId}`}
                className='flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0'
              >
                <div className='flex items-center gap-4'>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-sm font-mono text-gray-900'>
                        #{ticket.ticketId}
                      </span>
                      <span className='text-xs text-gray-400 uppercase tracking-wider'>
                        WINNER
                      </span>
                    </div>
                    <div className='text-xs text-gray-600'>
                      <span className='capitalize'>
                        {ticket.lotteryType} Lottery
                      </span>
                      <span className='text-gray-400 mx-2'>•</span>
                      <span>Draw: {formatDistanceToNow(ticket.drawTime)}</span>
                    </div>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='text-sm font-mono text-gray-900'>
                    {formatUSDC(ticket.prizeAmount || 0)}
                  </div>
                  <div className='text-xs text-gray-400 mt-1'>
                    {ticket.lotteryState === 'Completed'
                      ? 'Claimable'
                      : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {winningTickets.length > 5 && (
            <div className='text-center mt-8'>
              <p className='text-xs text-gray-400 uppercase tracking-wider'>
                Showing 5 of {winningTickets.length} winning tickets
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Winnings State */}
      {winningTickets.length === 0 && userTickets.length > 0 && (
        <div className='text-center py-12 border border-dashed border-gray-200'>
          <p className='text-sm text-gray-500 mb-2'>No Winnings Yet</p>
          <p className='text-xs text-gray-400'>
            You have {userTickets.length} tickets purchased. Good luck with
            upcoming draws!
          </p>
        </div>
      )}
    </div>
  );
}
