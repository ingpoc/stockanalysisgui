import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleProgramError(error: any): string {
  // Check if it's an account allocation error (duplicate lottery)
  if (error.message?.includes('already in use')) {
    return 'A lottery of this type already exists for this time period. Please wait for the current one to complete.';
  }

  // Check if it's an Anchor error with specific lottery error codes
  if (error.code) {
    switch (error.code) {
      case 6000:
        return 'This lottery type is not supported';
      case 6001:
        return 'Invalid ticket price. Please check the amount';
      case 6002:
        return 'Invalid prize pool amount';
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
