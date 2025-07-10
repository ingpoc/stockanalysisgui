'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LotteryInfo } from '@/types/lottery_types';
import { formatUSDC, formatDistanceToNow } from '@/lib/utils';
import {
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Users,
  Trophy,
  Clock,
  AlertCircle,
  CheckCircle2,
  Pause,
} from 'lucide-react';

interface AdminLotteryTableProps {
  lotteries: LotteryInfo[];
  isLoading: boolean;
}

type FilterState =
  | 'all'
  | 'Open'
  | 'Locked'
  | 'Drawing'
  | 'AwaitingRandomness'
  | 'Completed'
  | 'Expired'
  | 'Cancelled';

export function AdminLotteryTable({
  lotteries,
  isLoading,
}: AdminLotteryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterState>('all');
  const [sortBy, setSortBy] = useState<
    'created' | 'drawTime' | 'tickets' | 'prizePool'
  >('created');

  const filteredAndSortedLotteries = useMemo(() => {
    let filtered = lotteries || [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lottery => {
        const lotteryTypeKey =
          typeof lottery.lotteryType === 'object' && lottery.lotteryType
            ? Object.keys(lottery.lotteryType)[0]
            : String(lottery.lotteryType);

        return (
          lottery.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lotteryTypeKey.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lottery => {
        const stateKey =
          typeof lottery.state === 'object' && lottery.state
            ? Object.keys(lottery.state)[0]
            : String(lottery.state);
        return stateKey.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return (
            new Date(b.drawTime * 1000).getTime() -
            new Date(a.drawTime * 1000).getTime()
          );
        case 'drawTime':
          return (
            new Date(a.drawTime * 1000).getTime() -
            new Date(b.drawTime * 1000).getTime()
          );
        case 'tickets':
          return b.totalTickets - a.totalTickets;
        case 'prizePool':
          return b.prizePool - a.prizePool;
        default:
          return 0;
      }
    });

    return filtered;
  }, [lotteries, searchTerm, statusFilter, sortBy]);

  const getStatusBadge = (state: any) => {
    // Extract state key from discriminated union
    const stateKey =
      typeof state === 'object' && state
        ? Object.keys(state)[0]
        : String(state);

    const statusConfig = {
      open: {
        variant: 'default' as const,
        icon: CheckCircle2,
        color: 'text-green-600',
      },
      locked: {
        variant: 'secondary' as const,
        icon: Pause,
        color: 'text-yellow-600',
      },
      drawing: {
        variant: 'default' as const,
        icon: Clock,
        color: 'text-blue-600',
      },
      awaitingRandomness: {
        variant: 'outline' as const,
        icon: Clock,
        color: 'text-purple-600',
      },
      completed: {
        variant: 'default' as const,
        icon: Trophy,
        color: 'text-emerald-600',
      },
      expired: {
        variant: 'destructive' as const,
        icon: AlertCircle,
        color: 'text-red-600',
      },
      cancelled: {
        variant: 'destructive' as const,
        icon: AlertCircle,
        color: 'text-red-600',
      },
    };

    const config =
      statusConfig[stateKey.toLowerCase() as keyof typeof statusConfig] ||
      statusConfig['open'];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className='flex items-center gap-1'>
        <IconComponent className={`h-3 w-3 ${config.color}`} />
        <span className='capitalize'>{stateKey}</span>
      </Badge>
    );
  };

  const getWinnerDisplay = (lottery: LotteryInfo) => {
    const isCompleted =
      typeof lottery.state === 'object' &&
      lottery.state &&
      'completed' in lottery.state;
    if (!isCompleted || !lottery.winningNumbers) {
      return <span className='text-gray-400'>—</span>;
    }

    const shortAddress = `${lottery.winningNumbers.slice(0, 6)}...${lottery.winningNumbers.slice(-4)}`;
    return (
      <div className='flex items-center gap-2'>
        <code className='text-xs bg-gray-100 px-2 py-1 rounded font-mono'>
          {shortAddress}
        </code>
        <Button
          variant='ghost'
          size='sm'
          onClick={() =>
            window.open(
              `https://explorer.solana.com/address/${lottery.winningNumbers}?cluster=devnet`,
              '_blank'
            )
          }
        >
          <ExternalLink className='h-3 w-3' />
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-light'>
            LOTTERY MANAGEMENT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-4'>
            <div className='h-10 bg-gray-200 rounded'></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-16 bg-gray-200 rounded'></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-light'>LOTTERY MANAGEMENT</CardTitle>

        {/* Filters and Search */}
        <div className='flex flex-col md:flex-row gap-4 mt-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search by ID or type...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={value => setStatusFilter(value as FilterState)}
          >
            <SelectTrigger className='w-48'>
              <Filter className='h-4 w-4 mr-2' />
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='Open'>Open</SelectItem>
              <SelectItem value='Locked'>Locked</SelectItem>
              <SelectItem value='Drawing'>Drawing</SelectItem>
              <SelectItem value='AwaitingRandomness'>
                Awaiting Randomness
              </SelectItem>
              <SelectItem value='Completed'>Completed</SelectItem>
              <SelectItem value='Expired'>Expired</SelectItem>
              <SelectItem value='Cancelled'>Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={value => setSortBy(value as typeof sortBy)}
          >
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='created'>Created Date</SelectItem>
              <SelectItem value='drawTime'>Draw Time</SelectItem>
              <SelectItem value='tickets'>Tickets Sold</SelectItem>
              <SelectItem value='prizePool'>Prize Pool</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredAndSortedLotteries.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>
            <Trophy className='h-12 w-12 mx-auto mb-4 text-gray-300' />
            <h3 className='text-lg font-medium mb-2'>No lotteries found</h3>
            <p className='text-sm'>
              {lotteries.length === 0
                ? 'No lotteries have been created yet.'
                : 'No lotteries match your current filters.'}
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-32'>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Tickets</TableHead>
                  <TableHead className='text-right'>Prize Pool</TableHead>
                  <TableHead className='text-right'>Commission</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Draw Time</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedLotteries.map(lottery => {
                  const commission =
                    lottery.totalTickets * lottery.ticketPrice * 0.02;
                  return (
                    <TableRow
                      key={lottery.address}
                      className='hover:bg-gray-50'
                    >
                      <TableCell className='font-mono text-xs'>
                        {lottery.address.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-gray-400' />
                          <span className='capitalize'>
                            {typeof lottery.lotteryType === 'object' &&
                            lottery.lotteryType
                              ? Object.keys(lottery.lotteryType)[0]
                              : String(lottery.lotteryType)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lottery.state)}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <Users className='h-3 w-3 text-gray-400' />
                          <span>{lottery.totalTickets.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-right font-mono text-sm'>
                        {formatUSDC(lottery.prizePool)}
                      </TableCell>
                      <TableCell className='text-right font-mono text-sm text-green-600'>
                        {formatUSDC(commission)}
                      </TableCell>
                      <TableCell>{getWinnerDisplay(lottery)}</TableCell>
                      <TableCell className='text-sm text-gray-600'>
                        {formatDistanceToNow(new Date(lottery.drawTime * 1000))}
                      </TableCell>
                      <TableCell className='text-sm text-gray-600'>
                        {formatDistanceToNow(new Date(lottery.drawTime * 1000))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
