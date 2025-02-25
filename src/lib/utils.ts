import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleProgramError(error: any): string {
  console.error('Program error details:', error);

  // Check if it's an account allocation error (duplicate lottery)
  if (error.message?.includes('already in use')) {
    return 'A lottery of this type already exists for this time period. Please wait for the current one to complete.';
  }

  // Check if it's a global config initialization error
  if (error.message?.includes('Global config account already initialized')) {
    return 'The program is already initialized. You can proceed to create lotteries.';
  }

  // Check if it's an Anchor error with specific lottery error codes
  if (error.code) {
    // Handle Anchor system error codes
    if (error.code === 3012) {
      if (error.message?.includes('creator_token_account')) {
        return 'Your USDC token account is not initialized. Please make sure you have a USDC token account.';
      }
      return 'Account not initialized. Please make sure the program is initialized first.';
    }

    switch (error.code) {
      case 6000:
        return 'This lottery type is not supported';
      case 6001:
        return 'Invalid ticket price. Please enter a valid positive number (e.g., 1.0 USDC)';
      case 6002:
        return 'Invalid prize pool amount. Please enter a valid positive number between 0 and 1000 USDC';
      case 6003:
        return 'Invalid lottery draw time';
      case 6004:
        return 'Invalid ticket purchase amount';
      case 6005:
        return 'Ticket purchase limit has been reached';
      case 6006:
        return 'Lottery is not open for ticket purchases';
      case 6007:
        return 'Lottery is currently in drawing state';
      case 6008:
        return 'Lottery has been completed';
      case 6009:
        return 'Lottery has expired';
      case 6010:
        return 'Invalid lottery state for this operation';
      case 6011:
        return 'Invalid account ownership';
      case 6012:
        return 'Invalid input parameters';
      case 6013:
        return 'Calculation error occurred';
      case 6018:
        return 'Token transfer failed. Please check your balance';
      case 6019:
        return 'Invalid token account';
      default:
        return 'An unexpected error occurred';
    }
  }

  // Check if it's a wallet error
  if (error.message?.includes('wallet')) {
    return 'Please connect your wallet to continue';
  }

  // Check if it's a transaction error
  if (error.message?.includes('Transaction failed')) {
    return 'Transaction failed. Please try again';
  }

  // Check if it's a simulation error
  if (error.message?.includes('Simulation failed')) {
    return 'Transaction simulation failed. Please check your inputs';
  }

  // Check if it's a network error
  if (error.message?.includes('network') || error.message?.includes('connection')) {
    return 'Network error. Please check your connection and try again';
  }

  return error.message || 'An unexpected error occurred';
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Formats a number from the smallest USDC unit (6 decimals) to a human-readable USDC value
 * @param value The value in the smallest USDC unit
 * @param decimals The number of decimal places to show (default: 2)
 * @returns Formatted USDC value as a string
 */
export function formatUSDC(value: number | undefined, decimals: number = 2): string {
  if (value === undefined || value === null) {
    return '0 USDC';
  }
  
  // USDC has 6 decimal places
  const usdcValue = value / 1_000_000;
  
  // Format with the specified number of decimal places
  return `${usdcValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} USDC`;
}
