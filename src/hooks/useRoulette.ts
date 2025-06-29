import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RouletteProgram, RouletteType, BetType } from '@/lib/solana/roulette-program'
import type { RouletteAccount } from '@/lib/solana/roulette-program'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWallet } from './useWallet'
import { PublicKey } from '@solana/web3.js'
import type { AnchorWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { handleProgramError } from '@/lib/utils'

// Extended roulette type with UI fields
interface RouletteWithMetadata extends RouletteAccount {
  totalPlayers: number
  totalBetAmount: number
  winningNumber: number | null
  state: string
  rouletteType: any
  minBet: number
  maxBet: number
  totalBets: number
}

export function useRoulette() {
  const { connection } = useConnection()
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const queryClient = useQueryClient()

  const anchorWallet: AnchorWallet | undefined = publicKey && signTransaction && signAllTransactions ? {
    publicKey: publicKey,
    signTransaction: signTransaction,
    signAllTransactions: signAllTransactions
  } : undefined

  const program = anchorWallet ? new RouletteProgram(connection, anchorWallet) : null

  // Get all roulette games
  const { data: roulettes, isLoading, error } = useQuery<RouletteWithMetadata[], Error>({
    queryKey: ['roulettes', publicKey],
    queryFn: async () => {
      if (!program) throw new Error('Wallet not connected')
      const accounts = await program.getAllRouletteAccounts()
      
      // Map accounts to include UI-friendly fields
      return accounts.map((account: any) => ({
        ...account,
        totalPlayers: account.totalBets?.toNumber() || 0,
        totalBetAmount: account.totalBetAmount?.toNumber() || 0,
        winningNumber: account.winningNumber !== undefined ? account.winningNumber : null,
        state: account.state ? Object.keys(account.state)[0] : 'unknown',
        // Access nested properties safely
        rouletteType: account.rouletteType || { european: {} },
        minBet: account.minBet?.toNumber() || 0,
        maxBet: account.maxBet?.toNumber() || 0,
        totalBets: account.totalBets?.toNumber() || 0,
      }))
    },
    enabled: !!program,
    staleTime: 30000
  })

  // Initialize roulette program (admin only)
  const initialize = useMutation({
    mutationFn: () => {
      if (!program) throw new Error('Wallet not connected')
      return program.initialize()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roulettes'] })
      toast.success('Roulette program initialized successfully!')
    },
    onError: (error) => {
      console.error('Roulette initialization failed:', error)
      const errorMessage = handleProgramError(error)
      toast.error('Roulette initialization failed', { description: errorMessage })
    }
  })

  // Create new roulette game
  const createRoulette = useMutation({
    mutationFn: ({
      rouletteType,
      minBet,
      maxBet,
      gameDuration,
      nonce
    }: {
      rouletteType: RouletteType
      minBet: number
      maxBet: number
      gameDuration: number
      nonce: number
    }) => {
      if (!program) throw new Error('Wallet not connected')
      
      // Client-side validation
      if (minBet <= 0) {
        throw new Error('Minimum bet must be greater than 0')
      }
      if (maxBet <= minBet) {
        throw new Error('Maximum bet must be greater than minimum bet')
      }
      if (gameDuration <= 0) {
        throw new Error('Game duration must be greater than 0')
      }
      
      return program.createRoulette(rouletteType, minBet, maxBet, gameDuration, nonce)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roulettes'] })
      toast.success('Roulette game created successfully!')
    },
    onError: (error) => {
      console.error('Roulette creation failed:', error)
      const errorMessage = handleProgramError(error)
      toast.error('Roulette creation failed', { description: errorMessage })
    }
  })

  // Place a bet
  const placeBet = useMutation({
    mutationFn: ({
      roulette,
      betType,
      betAmount,
      betNumbers
    }: {
      roulette: string
      betType: BetType
      betAmount: number
      betNumbers: number[]
    }) => {
      if (!program) throw new Error('Wallet not connected')
      
      // Client-side validation
      if (betAmount <= 0) {
        throw new Error('Bet amount must be greater than 0')
      }
      
      const roulettePubkey = new PublicKey(roulette)
      return program.placeBet(roulettePubkey, betType, betAmount, betNumbers)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roulettes'] })
      toast.success('Bet placed successfully!')
    },
    onError: (error) => {
      console.error('Bet placement failed:', error)
      const errorMessage = handleProgramError(error)
      toast.error('Bet placement failed', { description: errorMessage })
    }
  })

  // Lock betting
  const lockBetting = useMutation({
    mutationFn: ({ roulette }: { roulette: string }) => {
      if (!program) throw new Error('Wallet not connected')
      const roulettePubkey = new PublicKey(roulette)
      return program.lockBetting(roulettePubkey)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roulettes'] })
      toast.success('Betting locked successfully!')
    },
    onError: (error) => {
      console.error('Lock betting failed:', error)
      const errorMessage = handleProgramError(error)
      toast.error('Lock betting failed', { description: errorMessage })
    }
  })

  // Claim winnings
  const claimWinnings = useMutation({
    mutationFn: ({
      roulette,
      bet
    }: {
      roulette: string
      bet: string
    }) => {
      if (!program) throw new Error('Wallet not connected')
      const roulettePubkey = new PublicKey(roulette)
      const betPubkey = new PublicKey(bet)
      return program.claimWinnings(roulettePubkey, betPubkey)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roulettes'] })
      toast.success('Winnings claimed successfully!')
    },
    onError: (error) => {
      console.error('Claim winnings failed:', error)
      const errorMessage = handleProgramError(error)
      toast.error('Claim winnings failed', { description: errorMessage })
    }
  })

  // Get roulette account by address
  const getRouletteAccount = useCallback(async (address: string) => {
    if (!program) throw new Error('Wallet not connected')
    const roulettePubkey = new PublicKey(address)
    return program.fetchRouletteAccount(roulettePubkey)
  }, [program])

  // Get bets for a specific roulette
  const getBetsForRoulette = useCallback(async (roulette: string) => {
    if (!program) throw new Error('Wallet not connected')
    const roulettePubkey = new PublicKey(roulette)
    return program.getBetsForRoulette(roulettePubkey)
  }, [program])

  // Get user's bets
  const getUserBets = useCallback(async () => {
    if (!program || !publicKey) throw new Error('Wallet not connected')
    return program.getUserBets(publicKey)
  }, [program, publicKey])

  return {
    roulettes,
    isLoading,
    error,
    initialize: initialize.mutateAsync,
    createRoulette: createRoulette.mutateAsync,
    placeBet: placeBet.mutateAsync,
    lockBetting: lockBetting.mutateAsync,
    claimWinnings: claimWinnings.mutateAsync,
    getRouletteAccount,
    getBetsForRoulette,
    getUserBets,
    isInitializing: initialize.isPending,
    isCreating: createRoulette.isPending,
    isPlacingBet: placeBet.isPending,
    isLockingBetting: lockBetting.isPending,
    isClaimingWinnings: claimWinnings.isPending
  }
}