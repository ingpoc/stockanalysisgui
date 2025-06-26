/**
 * Comprehensive Lottery Types
 * 
 * This file contains UI-friendly types, helpers, and utilities for the
 * decentralized lottery program. Auto-generated types are available
 * in decentralized_lottery.ts.
 */

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// Re-export auto-generated types for convenience
export type { DecentralizedLottery } from './decentralized_lottery';

// ===== ENUMS =====

export type LotteryState = 
  | 'Created'
  | 'Open' 
  | 'Locked'
  | 'Drawing'
  | 'AwaitingRandomness'
  | 'Completed'
  | 'Expired'
  | 'Cancelled';

export type LotteryType = 
  | 'Daily'
  | 'Weekly'
  | 'Monthly';

// ===== CORE ACCOUNT TYPES =====

export interface GlobalConfig {
  admin: PublicKey;
  treasuryTokenAccount: PublicKey;
  treasuryFeePercentage: number;
  usdcMint: PublicKey;
}

export interface LotteryAccount {
  lotteryType: LotteryType;
  ticketPrice: BN;
  drawTime: BN;
  prizePool: BN;
  totalTickets: BN;
  winningTicket: PublicKey | null;
  state: LotteryState;
  createdBy: PublicKey;
  globalConfig: PublicKey;
  autoTransition: boolean;
  lastTicketId: BN;
  authority: PublicKey;
  vrfClient: PublicKey | null;
  vrfRandomness: Uint8Array | null;
  vrfRequestAccount: PublicKey | null;
  oraclePublickey: PublicKey | null;
  isPrizePoolLocked: boolean;
  targetPrizePool: BN;
  isClaimed: boolean;
  createdAt: BN;
  completedAt: BN | null;
}

export interface TicketAccount {
  lotteryId: PublicKey;
  ticketId: BN;
  owner: PublicKey;
  isClaimed: boolean;
  purchasedAt: BN;
}

// ===== EVENT TYPES =====

export interface DrawingStarted {
  lotteryId: PublicKey;
  timestamp: BN;
  totalTickets: BN;
  prizePool: BN;
  vrfClient: PublicKey | null;
}

export interface LotteryCreated {
  lotteryId: PublicKey;
  lotteryType: string;
  ticketPrice: BN;
  drawTime: BN;
  targetPrizePool: BN;
}

export interface LotteryStateChanged {
  lotteryId: PublicKey;
  previousState: LotteryState;
  newState: LotteryState;
  timestamp: BN;
  totalTicketsSold: BN;
  currentPrizePool: BN;
}

export interface PrizeClaimed {
  lotteryId: PublicKey;
  winner: PublicKey;
  prizeAmount: BN;
  treasuryFee: BN;
  timestamp: BN;
}

export interface RandomnessConsumed {
  lotteryId: PublicKey;
  randomness: Uint8Array;
  selectedTicketIndex: BN;
  timestamp: BN;
}

export interface RandomnessRequested {
  lotteryId: PublicKey;
  vrfClient: PublicKey;
  requestAccount: PublicKey;
  timestamp: BN;
}

export interface TicketPurchased {
  lotteryId: PublicKey;
  ticketId: BN;
  purchaser: PublicKey;
  ticketPrice: BN;
  timestamp: BN;
}

export interface TicketRefunded {
  lotteryId: PublicKey;
  ticketId: BN;
  refundRecipient: PublicKey;
  refundAmount: BN;
  timestamp: BN;
}

export interface TreasuryWithdrawal {
  recipient: PublicKey;
  amount: BN;
  timestamp: BN;
}

export interface VrfClientInitialized {
  vrfClient: PublicKey;
  authority: PublicKey;
  timestamp: BN;
}

export interface WinnerSelected {
  lotteryId: PublicKey;
  winningTicket: PublicKey;
  winner: PublicKey;
  prizeAmount: BN;
  timestamp: BN;
}

// ===== INSTRUCTION ARGUMENTS =====

export interface CreateLotteryArgs {
  lotteryTypeEnum: LotteryType;
  ticketPrice: BN;
  drawTime: BN;
  targetPrizePool: BN;
}

export interface TransitionStateArgs {
  nextState: LotteryState;
}

// ===== UI INTERFACE TYPES =====

// Complex LotteryInfo with nested account structure (for internal use)
export interface LotteryInfoDetailed {
  id: PublicKey;
  account: LotteryAccount;
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
  globalConfig?: GlobalConfig;
}

// Simple LotteryInfo interface for UI components (flat structure)
export interface LotteryInfo {
  address: string;
  lotteryType: LotteryType;
  ticketPrice: number;
  drawTime: number;
  prizePool: number;
  totalTickets: number;
  state: LotteryState;
  createdBy: string;
  globalConfig: string;
  winningNumbers: string | null;
  targetPrizePool?: number;
}

export interface TicketInfo {
  id: PublicKey;
  account: TicketAccount;
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
  InsufficientPrizeFunds = 6048
}

export interface LotteryError {
  code: LotteryErrorCode;
  name: string;
  message: string;
}

// ===== CONSTANTS =====

export const PROGRAM_ID = new PublicKey('9SL8XkX3pvqZ2fjiLMhCFfQn7Gfmpd9ru8rtHFsAPVgq');

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
  ticket: TICKET_SEED
};

// ===== STATE TRANSITION HELPERS =====

export const VALID_STATE_TRANSITIONS: Record<LotteryState, LotteryState[]> = {
  'Created': ['Open', 'Cancelled'],
  'Open': ['Locked', 'Drawing', 'Expired', 'Cancelled'],
  'Locked': ['Drawing', 'Expired', 'Cancelled'],
  'Drawing': ['AwaitingRandomness', 'Completed', 'Expired'],
  'AwaitingRandomness': ['Completed', 'Expired'],
  'Completed': [],
  'Expired': [],
  'Cancelled': []
};

export function isValidStateTransition(current: LotteryState, next: LotteryState): boolean {
  return VALID_STATE_TRANSITIONS[current].includes(next);
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

export function getLotteryStateColor(state: LotteryState): string {
  switch (state) {
    case 'Created': return 'gray';
    case 'Open': return 'green';
    case 'Locked': return 'yellow';
    case 'Drawing': return 'blue';
    case 'AwaitingRandomness': return 'blue';
    case 'Completed': return 'purple';
    case 'Expired': return 'red';
    case 'Cancelled': return 'red';
    default: return 'gray';
  }
}

export function getLotteryStateDescription(state: LotteryState): string {
  switch (state) {
    case 'Created': return 'Lottery has been created but not yet opened for tickets';
    case 'Open': return 'Tickets can be purchased';
    case 'Locked': return 'Ticket sales have ended, awaiting draw';
    case 'Drawing': return 'Draw is in progress';
    case 'AwaitingRandomness': return 'Waiting for VRF randomness';
    case 'Completed': return 'Draw completed, winner selected';
    case 'Expired': return 'Lottery has expired without completion';
    case 'Cancelled': return 'Lottery was cancelled';
    default: return 'Unknown state';
  }
}

export function canPurchaseTickets(state: LotteryState): boolean {
  return state === 'Open';
}

export function canClaim(state: LotteryState): boolean {
  return state === 'Completed';
}

export function canRefund(state: LotteryState): boolean {
  return state === 'Cancelled' || state === 'Expired';
}

// ===== LOTTERY TYPE HELPERS =====

export function getLotteryTypeDescription(type: LotteryType): string {
  switch (type) {
    case 'Daily': return 'Daily lottery - draws every 24 hours';
    case 'Weekly': return 'Weekly lottery - draws every 7 days';
    case 'Monthly': return 'Monthly lottery - draws every 30 days';
    default: return 'Unknown lottery type';
  }
}

export function getLotteryTypeDuration(type: LotteryType): number {
  switch (type) {
    case 'Daily': return 24 * 60 * 60; // 24 hours in seconds
    case 'Weekly': return 7 * 24 * 60 * 60; // 7 days in seconds
    case 'Monthly': return 30 * 24 * 60 * 60; // 30 days in seconds
    default: return 0;
  }
}

// ===== IDL REFERENCE =====

export const IDL_ADDRESS = PROGRAM_ID.toBase58();
export const IDL_VERSION = '0.1.0';

// For backward compatibility with existing code
export type { LotteryAccount as Lottery };
export type { TicketAccount as Ticket };
