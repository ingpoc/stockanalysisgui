'use client'

import { useState, useMemo } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { formatUSDC, formatDistanceToNow } from '@/lib/utils'
import { 
  ExternalLink, 
  Search, 
  Filter, 
  Calendar,
  Trophy,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Ticket as TicketIcon
} from 'lucide-react'

interface UserTicket {
  ticketId: number
  lotteryId: string
  lotteryType: string
  ticketPrice: number
  purchasedAt: Date
  lotteryState: string
  isWinner: boolean
  prizeAmount?: number
  drawTime: Date
}

interface UserTicketsTableProps {
  userTickets: UserTicket[]
  isLoading: boolean
}

type FilterState = 'all' | 'active' | 'completed' | 'won' | 'lost'

export function UserTicketsTable({ userTickets, isLoading }: UserTicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterState>('all')
  const [sortBy, setSortBy] = useState<'purchased' | 'drawTime' | 'prize' | 'state'>('purchased')

  const filteredAndSortedTickets = useMemo(() => {
    let filtered = userTickets || []

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.lotteryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.lotteryType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketId.toString().includes(searchTerm)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'active':
          filtered = filtered.filter(ticket => 
            ['Open', 'Locked', 'Drawing', 'AwaitingRandomness'].includes(ticket.lotteryState)
          )
          break
        case 'completed':
          filtered = filtered.filter(ticket => 
            ['Completed', 'Expired', 'Cancelled'].includes(ticket.lotteryState)
          )
          break
        case 'won':
          filtered = filtered.filter(ticket => ticket.isWinner)
          break
        case 'lost':
          filtered = filtered.filter(ticket => 
            ticket.lotteryState === 'Completed' && !ticket.isWinner
          )
          break
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'purchased':
          return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
        case 'drawTime':
          return new Date(a.drawTime).getTime() - new Date(b.drawTime).getTime()
        case 'prize':
          return (b.prizeAmount || 0) - (a.prizeAmount || 0)
        case 'state':
          return a.lotteryState.localeCompare(b.lotteryState)
        default:
          return 0
      }
    })

    return filtered
  }, [userTickets, searchTerm, statusFilter, sortBy])

  const getStatusBadge = (ticket: UserTicket) => {
    if (ticket.isWinner) {
      return (
        <Badge className="flex items-center gap-1 bg-green-100 text-green-800">
          <Trophy className="h-3 w-3" />
          Winner!
        </Badge>
      )
    }

    switch (ticket.lotteryState) {
      case 'Open':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Active
          </Badge>
        )
      case 'Locked':
      case 'Drawing':
      case 'AwaitingRandomness':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Drawing
          </Badge>
        )
      case 'Completed':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Complete
          </Badge>
        )
      case 'Expired':
      case 'Cancelled':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {ticket.lotteryState}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {ticket.lotteryState}
          </Badge>
        )
    }
  }

  const getPrizeDisplay = (ticket: UserTicket) => {
    if (ticket.isWinner && ticket.prizeAmount) {
      return (
        <div className="flex items-center gap-1 text-green-600 font-medium">
          <DollarSign className="h-3 w-3" />
          {formatUSDC(ticket.prizeAmount)}
        </div>
      )
    }
    return <span className="text-gray-400">—</span>
  }

  if (isLoading) {
    return (
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-8">YOUR TICKETS</div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-8">YOUR TICKETS</div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by ticket ID, lottery ID, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterState)}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter tickets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="purchased">Purchase Date</SelectItem>
            <SelectItem value="drawTime">Draw Time</SelectItem>
            <SelectItem value="prize">Prize Amount</SelectItem>
            <SelectItem value="state">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        {filteredAndSortedTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200">
            <p className="text-sm mb-2">No tickets found</p>
            <p className="text-xs text-gray-400">
              {userTickets.length === 0 
                ? "You haven't purchased any tickets yet. Start playing to see your tickets here!" 
                : "No tickets match your current filters."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Ticket #</TableHead>
                  <TableHead>Lottery</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ticket Price</TableHead>
                  <TableHead className="text-right">Prize Won</TableHead>
                  <TableHead>Draw Time</TableHead>
                  <TableHead>Purchased</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTickets.map((ticket) => (
                  <TableRow key={`${ticket.lotteryId}-${ticket.ticketId}`} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">
                      #{ticket.ticketId}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {ticket.lotteryId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="capitalize">
                          {ticket.lotteryType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ticket)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatUSDC(ticket.ticketPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getPrizeDisplay(ticket)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDistanceToNow(ticket.drawTime)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDistanceToNow(ticket.purchasedAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://explorer.solana.com/address/${ticket.lotteryId}?cluster=devnet`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}