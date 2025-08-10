import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  Transaction, 
  TransactionSignature, 
  ConfirmOptions,
  Connection,
  PublicKey,
  VersionedTransaction
} from '@solana/web3.js';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface TransactionState {
  isLoading: boolean;
  error: string | null;
  signature: string | null;
}

interface UseTransactionReturn {
  executeTransaction: (
    transaction: Transaction | VersionedTransaction,
    options?: ConfirmOptions
  ) => Promise<TransactionSignature>;
  state: TransactionState;
  reset: () => void;
}

const DEFAULT_CONFIRM_OPTIONS: ConfirmOptions = {
  commitment: 'confirmed',
  preflightCommitment: 'confirmed',
  skipPreflight: false,
};

export function useTransaction(): UseTransactionReturn {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    signature: null,
  });

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      signature: null,
    });
  }, []);

  const executeTransaction = useCallback(async (
    transaction: Transaction | VersionedTransaction,
    options: ConfirmOptions = DEFAULT_CONFIRM_OPTIONS
  ): Promise<TransactionSignature> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      const error = 'Wallet not connected or does not support signing';
      setState(prev => ({ ...prev, error }));
      toast.error('Wallet Error', {
        description: error,
      });
      throw new Error(error);
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, signature: null }));

    try {
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash(options.commitment);
      
      if (transaction instanceof Transaction) {
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;
      }

      // Sign transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: options.skipPreflight,
          preflightCommitment: options.preflightCommitment,
        }
      );

      // Confirm transaction
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
      }, options.commitment);

      if (confirmation.value.err) {
        const error = `Transaction failed: ${confirmation.value.err.toString()}`;
        setState(prev => ({ ...prev, isLoading: false, error }));
        toast.error('Transaction Failed', {
          description: error,
        });
        throw new Error(error);
      }

      setState(prev => ({ ...prev, isLoading: false, signature }));
      
      toast.success('Transaction Successful', {
        description: `Transaction confirmed: ${signature.slice(0, 8)}...`,
      });

      return signature;

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown transaction error';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      
      toast.error('Transaction Error', {
        description: errorMessage,
      });
      
      throw error;
    }
  }, [connection, wallet]);

  return {
    executeTransaction,
    state,
    reset,
  };
}

// Utility function to check if a transaction signature exists and is confirmed
export async function checkTransactionStatus(
  connection: Connection,
  signature: TransactionSignature,
  commitment: ConfirmOptions['commitment'] = 'confirmed'
): Promise<{ exists: boolean; confirmed: boolean; error?: string }> {
  try {
    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });

    if (!status.value) {
      return { exists: false, confirmed: false };
    }

    return {
      exists: true,
      confirmed: status.value.confirmationStatus === commitment,
      error: status.value.err?.toString(),
    };
  } catch (error) {
    return {
      exists: false,
      confirmed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Utility function to estimate transaction fees
export async function estimateTransactionFee(
  connection: Connection,
  transaction: Transaction,
  commitment: ConfirmOptions['commitment'] = 'confirmed'
): Promise<number> {
  try {
    const { blockhash } = await connection.getLatestBlockhash(commitment);
    transaction.recentBlockhash = blockhash;
    
    const fee = await connection.getFeeForMessage(
      transaction.compileMessage(),
      commitment
    );
    
    return fee.value || 0;
  } catch (error) {
    console.error('Error estimating transaction fee:', error);
    return 5000; // Default fallback fee in lamports
  }
}