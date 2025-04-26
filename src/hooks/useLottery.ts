import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LotteryProgram } from '@/lib/solana/program'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWallet } from './useWallet'
import { LotteryType, LotteryInfo, LotteryState } from '@/types/lottery'
import { PublicKey } from '@solana/web3.js'
import type { AnchorWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { handleProgramError } from '@/lib/utils'

export function useLottery() {
  const { connection } = useConnection()
  const { address } = useWallet()
  const queryClient = useQueryClient()

  const anchorWallet: AnchorWallet | undefined = address ? {
    publicKey: new PublicKey(address),
    signTransaction: async () => { throw new Error('Not implemented') },
    signAllTransactions: async () => { throw new Error('Not implemented') }
  } : undefined

  const program = anchorWallet ? new LotteryProgram(connection, anchorWallet) : null

  const { data: lotteries, isLoading, error } = useQuery<LotteryInfo[], Error>({
    queryKey: ['lotteries', address],
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
      return program.createLottery(type, ticketPrice, drawTime, prizePool)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lotteries'] })
  })

  const buyTicket = useMutation({
    mutationFn: async ({
      lotteryAddress,
      numberOfTickets
    }: {
      lotteryAddress: string
      numberOfTickets: number
    }) => {
      if (!program) throw new Error('Wallet not connected')
      const isValid = await program.validateLotteryState(lotteryAddress)
      if (!isValid) throw new Error('Lottery is not open for ticket purchases')
      return program.buyTicket(lotteryAddress, numberOfTickets)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lotteries'] })
  })

  const transitionState = useMutation({
    mutationFn: ({
      lotteryAddress,
      newState
    }: {
      lotteryAddress: string
      newState: LotteryState // Assuming LotteryState is imported from types
    }) => {
      if (!program) throw new Error('Wallet not connected')
      const lotteryPubkey = new PublicKey(lotteryAddress)
      return program.transitionState(lotteryPubkey, newState)
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific lottery query or all lotteries
      queryClient.invalidateQueries({ queryKey: ['lotteries', address] })
      // Optionally, update the cache directly if the mutation returns the updated lottery
      // queryClient.setQueryData(['lottery', variables.lotteryAddress], updatedData)
      toast.success(`Lottery state transitioned successfully to ${variables.newState}`)
    },
    onError: (error, variables) => {
      console.error(`State transition to ${variables.newState} failed:`, error)
      const errorMessage = handleProgramError(error) // Assuming handleProgramError is available/imported
      toast.error(`State transition failed`, { description: errorMessage })
    }
  })

  const subscribeLottery = useCallback(
    (lotteryAddress: string, callback: (lottery: LotteryInfo) => void) => {
      if (!program) throw new Error('Wallet not connected')
      return program.subscribeToLotteryChanges(lotteryAddress, callback)
    }, 
    [program]
  )

  const unsubscribeLottery = useCallback(
    (subscriptionId: number) => program?.unsubscribe(subscriptionId),
    [program]
  )

  return {
    lotteries,
    isLoading,
    error,
    createLottery: createLottery.mutateAsync,
    buyTicket: buyTicket.mutateAsync,
    transitionState: transitionState.mutateAsync,
    subscribeLottery,
    unsubscribeLottery,
    isCreating: createLottery.isPending,
    isBuying: buyTicket.isPending,
    isTransitioning: transitionState.isPending
  }
} 