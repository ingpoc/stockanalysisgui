import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleProgramError(error: any): string {
  console.error('Program error:', error);

  // Check if it's an Anchor error
  if (error.code) {
    switch (error.code) {
      case 6000:
        return 'Invalid lottery state';
      case 6001:
        return 'Lottery not found';
      case 6002:
        return 'Insufficient funds for ticket';
      case 6003:
        return 'Invalid ticket number';
      case 6004:
        return 'Lottery has ended';
      case 6005:
        return 'Unauthorized access';
      case 6006:
        return 'No prize to claim';
      case 6007:
        return 'Invalid prize amount';
      case 6008:
        return 'Invalid token account';
      case 6009:
        return 'Arithmetic overflow';
      default:
        return 'An unexpected error occurred';
    }
  }

  // Check if it's a wallet error
  if (error.message?.includes('wallet')) {
    return 'Please connect your wallet';
  }

  // Check if it's a network error
  if (error.message?.includes('network') || error.message?.includes('connection')) {
    return 'Network error. Please try again';
  }

  return error.message || 'An unexpected error occurred';
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
