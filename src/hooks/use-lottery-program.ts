import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { LOTTERY_PROGRAM_ID } from '@/lib/constants';

// Import the IDL
import idl from '@/lib/solana/decentralized_lottery.json';

export function useLotteryProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) {
      return null;
    }

    try {
      const provider = new AnchorProvider(
        connection,
        wallet,
        { 
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );

      const program = new Program(
        idl as any,
        provider
      );

      return program;
    } catch (error) {
      console.error('Failed to initialize lottery program:', error);
      return null;
    }
  }, [connection, wallet]);
}
