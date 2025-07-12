import { useQuery } from '@tanstack/react-query';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from './useWallet';
import { LotteryProgram } from '@/lib/solana/program';
import type { AnchorWallet } from '@solana/wallet-adapter-react';

export function useUserDashboard() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const anchorWallet: AnchorWallet | undefined =
    publicKey && signTransaction && signAllTransactions
      ? {
          publicKey: publicKey,
          signTransaction: signTransaction,
          signAllTransactions: signAllTransactions,
        }
      : undefined;

  const program = anchorWallet
    ? new LotteryProgram(connection, anchorWallet)
    : null;

  // Get user tickets
  const {
    data: userTickets,
    isLoading: ticketsLoading,
    error: ticketsError,
  } = useQuery({
    queryKey: ['userTickets', publicKey?.toBase58()],
    queryFn: async () => {
      if (!program || !publicKey) throw new Error('Wallet not connected');
      return program.getUserTickets();
    },
    enabled: !!program && !!publicKey,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // 30 seconds
  });

  // Get user balance and financial data
  const {
    data: userBalance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useQuery({
    queryKey: ['userBalance', publicKey?.toBase58()],
    queryFn: async () => {
      if (!program || !publicKey) throw new Error('Wallet not connected');
      return program.getUserBalance();
    },
    enabled: !!program && !!publicKey,
    staleTime: 5000, // 5 seconds
    refetchInterval: 15000, // 15 seconds
  });

  // Get user statistics
  const {
    data: userStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['userStats', publicKey?.toBase58()],
    queryFn: async () => {
      if (!program || !publicKey) throw new Error('Wallet not connected');
      return program.getUserStats();
    },
    enabled: !!program && !!publicKey,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // 30 seconds
  });

  const isLoading = ticketsLoading || balanceLoading || statsLoading;
  const error = ticketsError || balanceError || statsError;

  return {
    userTickets: userTickets || [],
    userBalance: userBalance || {
      usdcBalance: 0,
      totalSpent: 0,
      totalWinnings: 0,
      netPosition: 0,
    },
    userStats: userStats || {
      totalTickets: 0,
      activeLotteries: 0,
      completedLotteries: 0,
      wonLotteries: 0,
      pendingWinnings: 0,
    },
    isLoading,
    error,
    refetch: () => {
      // Manual refetch all user data
      return Promise.all([
        program?.getUserTickets(),
        program?.getUserBalance(),
        program?.getUserStats(),
      ]);
    },
  };
}
