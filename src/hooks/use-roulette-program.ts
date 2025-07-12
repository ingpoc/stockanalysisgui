import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { RouletteProgram } from '@/lib/solana/roulette-program';

export function useRouletteProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }
    return new RouletteProgram(connection, wallet);
  }, [connection, wallet]);
}
