// Enhanced Auto-generated types from IDL

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

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

export enum RouletteType {
  European = 'European',
  American = 'American',
}

export interface BetAccount {
  roulette: any;
  bet_id: BN;
  bettor: any;
  bet_type: BetType;
  bet_amount: BN;
  bet_numbers: Uint8Array;
  payout_multiplier: number;
  is_winner: boolean;
  payout_amount: BN;
  is_claimed: boolean;
  placed_at: BN;
  claimed_at: BN | null;
  bump: number;
}

export interface GlobalConfig {
  authority: any;
  usdc_mint: any;
  treasury_token_account: any;
  treasury_fee_percentage: number;
  is_paused: boolean;
  min_game_duration: BN;
  max_game_duration: BN;
  min_bet_amount: BN;
  max_bet_amount: BN;
  max_players_per_game: BN;
  created_at: BN;
  updated_at: BN;
  bump: number;
}

export interface RouletteAccount {
  roulette_type: RouletteType;
  min_bet: BN;
  max_bet: BN;
  game_duration: BN;
  betting_duration: BN;
  start_time: BN;
  betting_end_time: BN;
  spin_time: BN;
  reveal_time: BN;
  end_time: BN;
  state: RouletteState;
  total_bets: BN;
  total_bet_amount: BN;
  total_players: BN;
  winning_number: number | null;
  last_bet_id: BN;
  created_by: any;
  authority: any;
  global_config: any;
  vrf_client: any | null;
  vrf_randomness: number[] | null;
  vrf_request_key: any | null;
  randomness_fulfilled: boolean;
  total_payouts: BN;
  house_edge_collected: BN;
  treasury_fee_collected: BN;
  is_settled: boolean;
  created_at: BN;
  completed_at: BN | null;
  nonce: BN;
  bump: number;
}

export interface Cancel_rouletteArgs {
  reason: string;
}

export interface Claim_winningsArgs {}

export interface Create_next_gameArgs {
  nonce: BN;
}

export interface Create_rouletteArgs {
  roulette_type: RouletteType;
  min_bet: BN;
  max_bet: BN;
  game_duration: BN;
  nonce: BN;
}

export interface InitializeArgs {}

export interface Lock_bettingArgs {}

export interface Place_betArgs {
  bet_type: BetType;
  bet_amount: BN;
  bet_numbers: Uint8Array;
}

export interface Process_automationArgs {}

export interface Process_game_lifecycleArgs {}

export interface BetPlaced {
  // Event structure - refer to program definition
  [key: string]: any;
}

export interface BettingLocked {
  // Event structure - refer to program definition
  [key: string]: any;
}

export interface RandomnessRequested {
  // Event structure - refer to program definition
  [key: string]: any;
}

export interface RouletteCancelled {
  // Event structure - refer to program definition
  [key: string]: any;
}

export interface RouletteCreated {
  // Event structure - refer to program definition
  [key: string]: any;
}

export interface RouletteExpired {
  // Event structure - refer to program definition
  [key: string]: any;
}

export interface RouletteSpinStarted {
  // Event structure - refer to program definition
  [key: string]: any;
}

export interface RouletteSpun {
  // Event structure - refer to program definition
  [key: string]: any;
}

export interface RouletteStateChanged {
  // Event structure - refer to program definition
  [key: string]: any;
}

export interface WinningsClaimed {
  // Event structure - refer to program definition
  [key: string]: any;
}

export enum ProgramError {
  InvalidBetType = 12000,
  BetBelowMinimum = 12001,
  BetExceedsMaximum = 12002,
  BettingPeriodEnded = 12003,
  InvalidGameState = 12004,
  InvalidBetNumbers = 12005,
  MaxPlayersReached = 12006,
  RandomnessNotFulfilled = 12007,
  WinningsAlreadyClaimed = 12008,
  NotAWinningBet = 12009,
  GameExpired = 12010,
  GamePaused = 12011,
  InvalidAuthority = 12012,
  InvalidRouletteType = 12013,
  GameDurationTooShort = 12014,
  GameDurationTooLong = 12015,
  InvalidStateTransition = 12016,
  VrfClientNotInitialized = 12017,
  InvalidVrfAccount = 12018,
  ArithmeticOverflow = 12019,
  InsufficientFunds = 12020,
  InvalidTokenAccount = 12021,
  TooEarly = 12022,
  TooLate = 12023,
  InvalidNonce = 12024,
  DuplicateBet = 12025,
}

// UI Helper types
export type DisplayFormat = 'number' | 'string' | 'formatted';

export interface TokenDisplayProps {
  amount: string | number;
  decimals: number;
  format?: DisplayFormat;
}

export interface AccountDisplayInfo<T> {
  publicKey: PublicKey;
  account: T;
  // Display-friendly properties
  [key: string]: any;
}

// Utility functions
export function formatTokenAmount(amount: BN, decimals = 6): number {
  return amount.toNumber() / Math.pow(10, decimals);
}

export function parseTokenAmount(amount: number, decimals = 6): BN {
  return new BN(amount * Math.pow(10, decimals));
}

export function formatTimestamp(timestamp: BN): Date {
  return new Date(timestamp.toNumber() * 1000);
}
