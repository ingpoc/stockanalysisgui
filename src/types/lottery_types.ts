/**
 * Comprehensive Lottery Types
 *
 * This file contains UI-friendly types, helpers, and utilities for the
 * decentralized lottery program. Auto-generated types are available
 * in decentralized_lottery.ts.
 */

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// Import the main generated type
import type { Decentralized_lotteryProgram } from './decentralized_lottery';

// Define the types manually since they may not be in the IDL
export type LotteryState =
  | { created: {} }
  | { open: {} }
  | { locked: {} }
  | { drawing: {} }
  | { awaitingRandomness: {} }
  | { completed: {} }
  | { expired: {} }
  | { cancelled: {} };

export type LotteryType = { daily: {} } | { weekly: {} } | { monthly: {} };

// Define account types as any for now to avoid type errors
export type GlobalConfig = any;
export type LotteryAccount = any;
export type TicketAccount = any;

// For backward compatibility, create aliases
export type LotteryStateIDL = LotteryState;
export type LotteryTypeIDL = LotteryType;
export type LotteryAccountIDL = LotteryAccount;
export type TicketAccountIDL = TicketAccount;
export type GlobalConfigIDL = GlobalConfig;

// ===== UI INTERFACE TYPES =====

// Complex LotteryInfo with nested account structure (for internal use)
export interface LotteryInfoDetailed {
  id: PublicKey;
  account: LotteryAccountIDL;
  // Display-friendly properties
  ticketPriceDisplay: number;
  prizePoolDisplay: number;
  targetPrizePoolDisplay: number;
  drawTimeDisplay: Date;
  createdAtDisplay: Date;
  completedAtDisplay: Date | null;
  totalTicketsDisplay: number;
  lastTicketIdDisplay: number;
  winningNumbers?: number[];
  globalConfig?: GlobalConfigIDL;
}

// Simple LotteryInfo interface for UI components (flat structure)
export interface LotteryInfo {
  address: string;
  lotteryType: string; // UI uses string representation
  ticketPrice: number;
  drawTime: number;
  prizePool: number;
  totalTickets: number;
  state: string; // UI uses string representation
  createdBy: string;
  globalConfig: string;
  winningNumbers: string | null;
  targetPrizePool?: number;
}

export interface TicketInfo {
  id: PublicKey;
  account: TicketAccountIDL;
  // Display-friendly properties
  ticketIdDisplay: number;
  purchasedAtDisplay: Date;
}

// ===== ERROR TYPES =====

export enum LotteryErrorCode {
  UnsupportedLotteryType = 6000,
  InvalidTicketPrice = 6001,
  InvalidPrizePool = 6002,
  InvalidDrawTime = 6003,
  InvalidTicketAmount = 6004,
  TicketPurchaseLimitReached = 6005,
  LotteryNotOpen = 6006,
  LotteryDrawing = 6007,
  LotteryCompleted = 6008,
  LotteryExpired = 6009,
  InvalidLotteryState = 6010,
  InvalidAccountOwner = 6011,
  InvalidInstructionInput = 6012,
  SafeMathError = 6013,
  PrizeClaimTimeExpired = 6014,
  InvalidPrizeTier = 6015,
  TreasuryWithdrawalTimeLockNotReached = 6016,
  InvalidTreasuryMultisig = 6017,
  TokenTransferFailed = 6018,
  InvalidTokenAccount = 6019,
  InvalidTokenMint = 6020,
  OraclePriceFeedError = 6021,
  RandomnessGenerationFailed = 6022,
  UnauthorizedAccess = 6023,
  InvalidStateTransition = 6024,
  InvalidCancellation = 6025,
  AdminRequired = 6026,
  LotteryCancelled = 6027,
  LotteryNotOpenForTicketPurchases = 6028,
  LotteryAlreadyClaimed = 6029,
  PDADerivationError = 6030,
  InvalidWinningTicket = 6031,
  TicketAlreadyClaimed = 6032,
  InvalidStateForRefund = 6033,
  InvalidInput = 6034,
  TicketSaleEnded = 6035,
  LotteryAlreadyDrawn = 6036,
  NoTickets = 6037,
  InsufficientTicketsSold = 6038,
  LotteryNotDrawn = 6039,
  TicketNotEligibleForRefund = 6040,
  LotteryNotExpired = 6041,
  InvalidVrfAccount = 6042,
  InsufficientFunds = 6043,
  ArithmeticOverflow = 6044,
  TicketNotForThisLottery = 6045,
  NoWinnerSelected = 6046,
  EmptyPrizePool = 6047,
  InsufficientPrizeFunds = 6048,
}

export interface LotteryError {
  code: LotteryErrorCode;
  name: string;
  message: string;
}

// ===== CONSTANTS =====

export const PROGRAM_ID = new PublicKey(
  '9SL8XkX3pvqZ2fjiLMhCFfQn7Gfmpd9ru8rtHFsAPVgq'
);

export const LOTTERY_SEED = 'lottery';
export const GLOBAL_CONFIG_SEED = 'global_config_v2';
export const TICKET_SEED = 'ticket';

// USDC has 6 decimal places
export const USDC_DECIMALS = 6;

// ===== HELPER TYPES =====

export interface PDASeeds {
  lottery: string;
  globalConfig: string;
  ticket: string;
}

export const PDA_SEEDS: PDASeeds = {
  lottery: LOTTERY_SEED,
  globalConfig: GLOBAL_CONFIG_SEED,
  ticket: TICKET_SEED,
};

// ===== STATE TRANSITION HELPERS =====

// IMPORTANT: These transitions MUST match the smart contract's can_transition_to method
export const VALID_STATE_TRANSITIONS: Record<string, string[]> = {
  Created: ['Open', 'Cancelled'],
  Open: ['Locked', 'Cancelled'], // Smart contract does NOT allow Open → Drawing directly
  Locked: ['Drawing', 'Cancelled'],
  Drawing: ['AwaitingRandomness', 'Expired', 'Cancelled'],
  AwaitingRandomness: ['Completed', 'Expired', 'Cancelled'],
  Completed: [], // Terminal state
  Expired: [], // Terminal state
  Cancelled: [], // Terminal state
};

export function isValidStateTransition(
  current: LotteryStateIDL,
  next: LotteryStateIDL
): boolean {
  const currentKey = Object.keys(current)[0];
  const nextKey = Object.keys(next)[0];
  return VALID_STATE_TRANSITIONS[currentKey].includes(nextKey);
}

// ===== DISPLAY HELPERS =====

// Helper to get string representation of discriminated union state
export function getStateString(state: LotteryStateIDL): string {
  if (typeof state === 'object' && state) {
    return Object.keys(state)[0];
  }
  return String(state);
}

// Helper to get display name for state (capitalized)
export function getStateDisplayName(state: LotteryStateIDL): string {
  const stateStr = getStateString(state);
  return stateStr.charAt(0).toUpperCase() + stateStr.slice(1);
}

// Helper to get string representation of discriminated union type
export function getTypeString(type: LotteryTypeIDL): string {
  if (typeof type === 'object' && type) {
    return Object.keys(type)[0];
  }
  return String(type);
}

// Helper to get display name for type (capitalized)
export function getTypeDisplayName(type: LotteryTypeIDL): string {
  const typeStr = getTypeString(type);
  return typeStr.charAt(0).toUpperCase() + typeStr.slice(1);
}

// Helper to check if state matches a specific value
export function isStateEqual(state: LotteryStateIDL, target: string): boolean {
  return getStateString(state).toLowerCase() === target.toLowerCase();
}

// Helper to check if type matches a specific value
export function isTypeEqual(type: LotteryTypeIDL, target: string): boolean {
  return getTypeString(type).toLowerCase() === target.toLowerCase();
}

// ===== DISPLAY HELPERS =====

export function formatUSDC(amount: BN | number): number {
  const amountNum = typeof amount === 'number' ? amount : amount.toNumber();
  return amountNum / Math.pow(10, USDC_DECIMALS);
}

export function parseUSDC(amount: number): BN {
  return new BN(amount * Math.pow(10, USDC_DECIMALS));
}

export function formatTimestamp(timestamp: BN): Date {
  return new Date(timestamp.toNumber() * 1000);
}

export function parseTimestamp(date: Date): BN {
  return new BN(Math.floor(date.getTime() / 1000));
}

// ===== LOTTERY STATE HELPERS =====

export function getLotteryStateColor(state: LotteryStateIDL): string {
  const key = Object.keys(state)[0];
  switch (key) {
    case 'created':
      return 'gray';
    case 'open':
      return 'green';
    case 'locked':
      return 'yellow';
    case 'drawing':
      return 'blue';
    case 'awaitingRandomness':
      return 'blue';
    case 'completed':
      return 'purple';
    case 'expired':
      return 'red';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
}

export function getLotteryStateDescription(state: LotteryStateIDL): string {
  const key = Object.keys(state)[0];
  switch (key) {
    case 'created':
      return 'Lottery has been created but not yet opened for tickets';
    case 'open':
      return 'Tickets can be purchased';
    case 'locked':
      return 'Ticket sales have ended, awaiting draw';
    case 'drawing':
      return 'Draw is in progress';
    case 'awaitingRandomness':
      return 'Waiting for VRF randomness';
    case 'completed':
      return 'Draw completed, winner selected';
    case 'expired':
      return 'Lottery has expired without completion';
    case 'cancelled':
      return 'Lottery was cancelled';
    default:
      return 'Unknown state';
  }
}

export function canPurchaseTickets(state: LotteryStateIDL): boolean {
  return Object.keys(state)[0] === 'open';
}

export function canClaim(state: LotteryStateIDL): boolean {
  return Object.keys(state)[0] === 'completed';
}

export function canRefund(state: LotteryStateIDL): boolean {
  const key = Object.keys(state)[0];
  return key === 'cancelled' || key === 'expired';
}

// ===== LOTTERY TYPE HELPERS =====

export function getLotteryTypeDescription(type: LotteryTypeIDL): string {
  const key = Object.keys(type)[0];
  switch (key) {
    case 'daily':
      return 'Daily lottery - draws every 24 hours';
    case 'weekly':
      return 'Weekly lottery - draws every 7 days';
    case 'monthly':
      return 'Monthly lottery - draws every 30 days';
    default:
      return 'Unknown lottery type';
  }
}

export function getLotteryTypeDuration(type: LotteryTypeIDL): number {
  const key = Object.keys(type)[0];
  switch (key) {
    case 'daily':
      return 24 * 60 * 60; // 24 hours in seconds
    case 'weekly':
      return 7 * 24 * 60 * 60; // 7 days in seconds
    case 'monthly':
      return 30 * 24 * 60 * 60; // 30 days in seconds
    default:
      return 0;
  }
}

// ===== IDL REFERENCE =====

export const IDL_ADDRESS = PROGRAM_ID.toBase58();
export const IDL_VERSION = '0.1.0';

// For backward compatibility with existing code
export type { LotteryAccount as Lottery };
export type { TicketAccount as Ticket };
