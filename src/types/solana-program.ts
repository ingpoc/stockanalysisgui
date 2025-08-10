import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// Base Program Types
export interface ProgramAccount<T> {
  account: T;
  publicKey: PublicKey;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

// Lottery Program Types
export interface LotteryAccount {
  lotteryType: LotteryType;
  ticketPrice: BN;
  drawTime: BN;
  targetPrizePool: BN;
  state: LotteryState;
  admin: PublicKey;
  globalConfig: PublicKey;
  lotteryUsdcAccount: PublicKey;
  totalTickets: BN;
  lastTicketId: BN;
  winner: PublicKey | null;
  prizePool: BN;
  completedAt: BN | null;
  nonce: BN;
  createdAt: BN;
  bump: number;
}

export interface TicketAccount {
  lottery: PublicKey;
  ticketId: BN;
  owner: PublicKey;
  purchasedAt: BN;
  bump: number;
}

export interface LotteryGlobalConfig {
  admin: PublicKey;
  usdcMint: PublicKey;
  treasuryTokenAccount: PublicKey;
  treasuryUsdcAccount: PublicKey;
  treasuryFeePercentage: number;
  isPaused: boolean;
  createdAt: BN;
  updatedAt: BN;
  bump: number;
}

export enum LotteryType {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Custom = 'Custom',
}

export enum LotteryState {
  Created = 'Created',
  Open = 'Open',
  Locked = 'Locked',
  Drawing = 'Drawing',
  AwaitingRandomness = 'AwaitingRandomness',
  Completed = 'Completed',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
}

// Roulette Program Types
export interface RouletteAccount {
  rouletteType: RouletteType;
  minBet: BN;
  maxBet: BN;
  gameDuration: BN;
  bettingDuration: BN;
  startTime: BN;
  bettingEndTime: BN;
  spinTime: BN;
  revealTime: BN;
  endTime: BN;
  state: RouletteState;
  createdBy: PublicKey;
  authority: PublicKey;
  globalConfig: PublicKey;
  rouletteUsdcAccount: PublicKey;
  treasuryUsdcAccount: PublicKey;
  totalBets: BN;
  totalBetAmount: BN;
  totalPlayers: BN;
  lastBetId: BN;
  winningNumber: number | null;
  randomnessFulfilled: boolean;
  vrfClient: PublicKey | null;
  vrfRequestTimestamp: BN | null;
  totalPayouts: BN;
  houseEdgeCollected: BN;
  treasuryFeeCollected: BN;
  isSettled: boolean;
  createdAt: BN;
  nonce: BN;
  bump: number;
}

export interface BetAccount {
  roulette: PublicKey;
  betId: BN;
  bettor: PublicKey;
  betType: BetType;
  betAmount: BN;
  betNumbers: number[];
  payoutMultiplier: number;
  placedAt: BN;
  claimedAt: BN | null;
  bump: number;
}

export interface RouletteGlobalConfig {
  authority: PublicKey;
  usdcMint: PublicKey;
  treasuryTokenAccount: PublicKey;
  treasuryUsdcAccount: PublicKey;
  treasuryFeePercentage: number;
  isPaused: boolean;
  minGameDuration: BN;
  maxGameDuration: BN;
  defaultGameDuration: BN;
  defaultBettingDuration: BN;
  minBetAmount: BN;
  maxBetAmount: BN;
  maxPlayersPerGame: BN;
  currentGameNonce: BN;
  totalRoulettesCreated: BN;
  keeperRewardAmount: BN;
  minKeeperBalance: BN;
  createdAt: BN;
  updatedAt: BN;
  bump: number;
}

export enum RouletteType {
  European = 'European',
  American = 'American',
  Custom = 'Custom',
}

export enum RouletteState {
  Created = 'Created',
  Open = 'Open',
  Locked = 'Locked',
  Spinning = 'Spinning',
  AwaitingRandomness = 'AwaitingRandomness',
  Completed = 'Completed',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
}

export enum BetType {
  Straight = 'Straight',
  Split = 'Split',
  Street = 'Street',
  Corner = 'Corner',
  SixLine = 'SixLine',
  Red = 'Red',
  Black = 'Black',
  Even = 'Even',
  Odd = 'Odd',
  Low = 'Low',
  High = 'High',
  FirstTwelve = 'FirstTwelve',
  SecondTwelve = 'SecondTwelve',
  ThirdTwelve = 'ThirdTwelve',
  FirstColumn = 'FirstColumn',
  SecondColumn = 'SecondColumn',
  ThirdColumn = 'ThirdColumn',
}

// Transaction Instruction Parameters
export interface CreateLotteryParams {
  lotteryType: LotteryType;
  ticketPrice: number;
  drawTime: number;
  targetPrizePool: number;
  nonce: number;
}

export interface BuyTicketParams {
  lottery: PublicKey;
}

export interface CreateRouletteParams {
  rouletteType: RouletteType;
  minBet: number;
  maxBet: number;
  gameDuration: number;
  nonce: number;
}

export interface PlaceBetParams {
  roulette: PublicKey;
  betType: BetType;
  betAmount: number;
  betNumbers: number[];
}

// Event Types
export interface LotteryCreatedEvent {
  lotteryId: PublicKey;
  lotteryType: LotteryType;
  ticketPrice: BN;
  drawTime: BN;
  targetPrizePool: BN;
  admin: PublicKey;
  timestamp: BN;
}

export interface RouletteCreatedEvent {
  rouletteId: PublicKey;
  authority: PublicKey;
  rouletteType: RouletteType;
  minBet: BN;
  maxBet: BN;
  gameDuration: BN;
  startTime: BN;
  bettingEndTime: BN;
  spinTime: BN;
  endTime: BN;
  isAutonomous: boolean;
  keeper: PublicKey;
  timestamp: BN;
}

export interface BetPlacedEvent {
  rouletteId: PublicKey;
  betId: BN;
  bettor: PublicKey;
  betType: BetType;
  betAmount: BN;
  betNumbers: number[];
  totalBets: BN;
  totalBetAmount: BN;
  timestamp: BN;
}

// Error Types
export interface ProgramError {
  code: number;
  name: string;
  msg: string;
}

// Utility Types
export type AccountInfo<T> = {
  account: T;
  publicKey: PublicKey;
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type CreateInstruction<T extends Record<string, any>> = T extends { publicKey: any } 
  ? Optional<T, 'publicKey'>
  : T;

// Hook Return Types
export interface UseLotteryProgramReturn {
  program: any | null;
  createLottery: (params: CreateLotteryParams) => Promise<TransactionResult>;
  buyTicket: (params: BuyTicketParams) => Promise<TransactionResult>;
  claimPrize: (lottery: PublicKey) => Promise<TransactionResult>;
  isLoading: boolean;
  error: string | null;
}

export interface UseRouletteProgramReturn {
  program: any | null;
  createRoulette: (params: CreateRouletteParams) => Promise<TransactionResult>;
  placeBet: (params: PlaceBetParams) => Promise<TransactionResult>;
  claimWinnings: (bet: PublicKey) => Promise<TransactionResult>;
  isLoading: boolean;
  error: string | null;
}