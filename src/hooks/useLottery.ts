import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LotteryProgram } from '@/lib/solana/program'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWallet } from './useWallet'
import { LotteryType, LotteryInfo, LotteryState } from '@/types/lottery_types'
import { PublicKey } from '@solana/web3.js'
import type { AnchorWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { handleProgramError } from '@/lib/utils'
import { BN } from 'bn.js'

export function useLottery() {
  const { connection } = useConnection()
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const queryClient = useQueryClient()

  const anchorWallet: AnchorWallet | undefined = publicKey && signTransaction && signAllTransactions ? {
    publicKey: publicKey,
    signTransaction: signTransaction,
    signAllTransactions: signAllTransactions
  } : undefined

  const program = anchorWallet ? new LotteryProgram(connection, anchorWallet) : null

  const { data: lotteries, isLoading, error } = useQuery<LotteryInfo[], Error>({
    queryKey: ['lotteries', publicKey],
    queryFn: () => {
      if (!program) throw new Error('Wallet not connected')
      return program.getLotteries()
    },
    enabled: !!program,
    staleTime: 30000
  })

  const createLottery = useMutation({
    mutationFn: ({
      type,
      ticketPrice,
      drawTime,
      prizePool
    }: {
      type: LotteryType
      ticketPrice: number
      drawTime: number
      prizePool: number
    }) => {
      if (!program) throw new Error('Wallet not connected')
      // Client-side validation
      if (ticketPrice <= 0) {
        throw new Error('Ticket price must be greater than 0')
      }
      const currentTime = Math.floor(new Date().getTime() / 1000)
      if (drawTime <= currentTime) {
        throw new Error('Draw time must be in the future')
      }
      if (prizePool < 0) {
        throw new Error('Prize pool cannot be negative')
      }
      
      // Type is already in the correct format ('Daily', 'Weekly', 'Monthly')
      return program.createLottery(type, ticketPrice, drawTime, prizePool)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lotteries'] }),
    onError: (error) => {
      console.error('Lottery creation failed:', error)
      toast.error('Lottery creation failed', { description: error.message })
    }
  })

  const buyTicket = useMutation({
    mutationFn: async ({
      lotteryAddress
    }: {
      lotteryAddress: string
    }) => {
      if (!program) throw new Error('Wallet not connected')
      // Note: Removed numberOfTickets parameter and validateLotteryState as they don't exist in the actual implementation
      return program.buyTicket(lotteryAddress)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lotteries'] })
      if (data === 'duplicate_transaction_success') {
        toast.success('Ticket purchased successfully!', {
          description: 'Transaction was already processed'
        })
      } else {
        toast.success('Ticket purchased successfully!')
      }
    },
    onError: (error) => {
      console.error('Ticket purchase failed:', error)
      const errorMessage = handleProgramError(error)
      toast.error('Ticket purchase failed', { description: errorMessage })
    },
    retry: false // Prevent automatic retries that can cause duplicate transactions
  })

  const transitionState = useMutation({
    mutationFn: ({
      lotteryAddress,
      newState
    }: {
      lotteryAddress: string
      newState: LotteryState
    }) => {
      if (!program) throw new Error('Wallet not connected')
      const lotteryPubkey = new PublicKey(lotteryAddress)
      
      // State is already in the correct format ('Created', 'Open', etc.)
      return program.transitionState(lotteryPubkey, newState)
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lotteries', publicKey] })
      if (data === 'duplicate_transaction_success') {
        toast.success(`Lottery state transitioned successfully to ${variables.newState}`, {
          description: 'Transaction was already processed'
        })
      } else {
        toast.success(`Lottery state transitioned successfully to ${variables.newState}`)
      }
    },
    onError: (error, variables) => {
      console.error(`State transition to ${variables.newState} failed:`, error)
      const errorMessage = handleProgramError(error)
      toast.error(`State transition failed`, { description: errorMessage })
    },
    retry: false // Prevent automatic retries that can cause duplicate transactions
  })

  // Note: Removed subscription methods as they don't exist in the actual LotteryProgram implementation

  return {
    lotteries,
    isLoading,
    error,
    createLottery: createLottery.mutateAsync,
    buyTicket: buyTicket.mutateAsync,
    transitionState: transitionState.mutateAsync,
    isCreating: createLottery.isPending,
    isBuying: buyTicket.isPending,
    isTransitioning: transitionState.isPending
  }
} 