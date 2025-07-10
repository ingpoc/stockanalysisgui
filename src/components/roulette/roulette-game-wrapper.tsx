'use client';

import { useCallback } from 'react';
import { RouletteGame3D } from './roulette-game-3d';
import { useRoulette } from '@/hooks/useRoulette';
import { useWallet } from '@solana/wallet-adapter-react';
import type { Bet } from './simple-roulette-wheel';

interface RouletteGameWrapperProps {
  playerWallet?: string;
}

export function RouletteGameWrapper({
  playerWallet,
}: RouletteGameWrapperProps) {
  const { publicKey } = useWallet();
  const { placeBet, error } = useRoulette();
  const walletAddress = playerWallet || publicKey?.toString();

  // Memoize the bet handler to prevent unnecessary re-renders
  const handlePlaceBet = useCallback(
    async (bet: Omit<Bet, 'player'>) => {
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      try {
        await placeBet({
          ...bet,
          player: walletAddress,
        } as any);
      } catch (err) {
        throw err; // Re-throw to allow error handling in child components
      }
    },
    [placeBet, walletAddress]
  );

  return (
    <div className='w-full h-full relative'>
      {error ? (
        <div className='w-full h-full flex flex-col items-center justify-center text-red-500 p-4 text-center'>
          <p>Error loading roulette games</p>
          <p className='text-sm text-gray-500 mt-2'>
            {error instanceof Error
              ? error.message
              : 'An unknown error occurred'}
          </p>
        </div>
      ) : (
        <RouletteGame3D
          playerWallet={walletAddress ?? undefined}
          onPlaceBet={handlePlaceBet}
        />
      )}
    </div>
  );
}
