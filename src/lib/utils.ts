import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow as dateFnsFormatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced error handling for Solana program errors
export function handleProgramError(error: any): string {
  if (error?.message) {
    // Extract specific error codes from Anchor program errors
    const anchorErrorMatch = error.message.match(/Error Number: (\d+)/);
    if (anchorErrorMatch) {
      const errorCode = parseInt(anchorErrorMatch[1]);
      return getRouletteErrorMessage(errorCode);
    }

    // Handle common Solana/Anchor errors
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient USDC balance to place bet';
    }
    if (error.message.includes('Transaction was not confirmed')) {
      return 'Transaction failed to confirm. Please try again.';
    }
    if (error.message.includes('Blockhash not found')) {
      return 'Network congestion. Please retry transaction.';
    }
    if (error.message.includes('User rejected the request')) {
      return 'Transaction cancelled by user';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// Map roulette program error codes to user-friendly messages
export function getRouletteErrorMessage(errorCode: number): string {
  const errorMap: Record<number, string> = {
    // Decentralized Roulette Program Errors (12000+)
    12000: 'Invalid bet type',
    12001: 'Bet amount below minimum',
    12002: 'Bet amount exceeds maximum',
    12003: 'Betting period has ended',
    12004: 'Game is not in correct state',
    12005: 'Invalid bet numbers for this bet type',
    12006: 'Maximum number of players reached',
    12007: 'Randomness not yet fulfilled',
    12008: 'Winnings already claimed',
    12009: 'Not a winning bet',
    12010: 'Game has expired',
    12011: 'Game is paused',
    12012: 'Invalid authority',
    12013: 'Invalid roulette type',
    12014: 'Game duration too short',
    12015: 'Game duration too long',
    12016: 'Cannot transition to this state',
    12017: 'VRF client not initialized',
    12018: 'Invalid VRF account',
    12019: 'Arithmetic overflow',
    12020: 'Insufficient funds',
    12021: 'Invalid token account',
    12022: 'Too early to perform this action',
    12023: 'Too late to perform this action',
    12024: 'Invalid nonce',
    12025: 'Cannot place duplicate bets',

    // Common Anchor/Solana errors
    100: 'Invalid instruction data',
    101: 'Invalid account data',
    102: 'Invalid account owner',
    103: 'Account not initialized',
    2003: 'Account does not have enough lamports',
    3001: 'Insufficient funds for transaction',
    3012: 'Transaction failed due to insufficient funds',
  };

  return errorMap[errorCode] || `Unknown error (Code: ${errorCode})`;
}

// Simplified event handling for better performance
export function createSimplifiedEventHandler(
  connection: any,
  programId: string,
  onEvent: (eventType: string, data: any) => void
) {
  let subscriptionId: number | null = null;

  const subscribe = () => {
    try {
      subscriptionId = connection.onLogs(
        programId,
        (logs: any, context: any) => {
          // Parse logs for key events with minimal processing
          logs.logs.forEach((log: string) => {
            // Detect key state transitions
            if (log.includes('Roulette completed:') || log.includes('winning number:')) {
              onEvent('gameCompleted', { signature: logs.signature, slot: context.slot });
            } else if (log.includes('Bet placed:')) {
              onEvent('betPlaced', { signature: logs.signature, slot: context.slot });
            } else if (log.includes('Betting locked')) {
              onEvent('bettingLocked', { signature: logs.signature, slot: context.slot });
            }
          });
        },
        'confirmed'
      );
    } catch (error) {
      console.warn('Event subscription failed:', error);
    }
  };

  const unsubscribe = () => {
    if (subscriptionId) {
      try {
        connection.removeOnLogsListener(subscriptionId);
      } catch (error) {
        console.warn('Event unsubscription failed:', error);
      }
      subscriptionId = null;
    }
  };

  return { subscribe, unsubscribe };
}

// Optimized state management helper
export function shouldRefreshState(eventType: string): boolean {
  const criticalEvents = ['gameCompleted', 'betPlaced', 'bettingLocked'];
  return criticalEvents.includes(eventType);
}

// Debounce function for reducing unnecessary API calls
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Smart polling strategy based on game state
export function getOptimalPollingInterval(hasActiveGames: boolean, gameStates: string[]): number {
  if (!hasActiveGames) return 30000; // 30 seconds for inactive
  
  const criticalStates = ['spinning', 'awaitingRandomness'];
  const hasCriticalStates = gameStates.some(state => 
    criticalStates.some(critical => state.toLowerCase().includes(critical))
  );
  
  return hasCriticalStates ? 3000 : 8000; // 3s for critical, 8s for normal
}

// Format USDC amounts with proper decimals
export function formatUSDC(amount: number | string | undefined): string {
  if (amount === undefined || amount === null) return '$0.00';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '$0.00';
  
  // Convert from base units (6 decimals for USDC) to display units
  const displayAmount = numericAmount / 1_000_000;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(displayAmount);
}

// Format time distance from now
export function formatDistanceToNow(date: Date | number | string): string {
  if (!date) return 'Unknown';
  
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return dateFnsFormatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
}
