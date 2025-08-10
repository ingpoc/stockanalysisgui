import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

// Auto-generated types from IDL for decentralized_roulette
// SECURITY: Program ID updated based on network configuration
export const PROGRAM_ID = "saLmMwuHKHDvaaPsA6GRaEjjzvmhx1VRgJGYeJpNDbr"; // Localnet ID

// Account Types
export interface BetAccount {
  roulette: PublicKey;
  bet_id: number;
  bettor: PublicKey;
  bet_type: BetType;
  bet_amount: number;
  bet_numbers: Uint8Array;
  payout_multiplier: number;
  is_winner: boolean;
  payout_amount: number;
  is_claimed: boolean;
  placed_at: number;
  claimed_at: number | null;
  bump: number;
}

export interface GlobalConfig {
  authority: PublicKey;
  usdc_mint: PublicKey;
  treasury_token_account: PublicKey;
  treasury_fee_percentage: number;
  is_paused: boolean;
  min_game_duration: number;
  max_game_duration: number;
  min_bet_amount: number;
  max_bet_amount: number;
  max_players_per_game: number;
  created_at: number;
  updated_at: number;
  bump: number;
}

export interface RouletteAccount {
  roulette_type: RouletteType;
  min_bet: number;
  max_bet: number;
  game_duration: number;
  betting_duration: number;
  start_time: number;
  betting_end_time: number;
  spin_time: number;
  reveal_time: number;
  end_time: number;
  state: RouletteState;
  total_bets: number;
  total_bet_amount: number;
  total_players: number;
  winning_number: number | null;
  last_bet_id: number;
  created_by: PublicKey;
  authority: PublicKey;
  global_config: PublicKey;
  vrf_client: PublicKey | null;
  vrf_randomness: number[] | null;
  vrf_request_key: PublicKey | null;
  randomness_fulfilled: boolean;
  total_payouts: number;
  house_edge_collected: number;
  treasury_fee_collected: number;
  is_settled: boolean;
  created_at: number;
  completed_at: number | null;
  nonce: number;
  bump: number;
}

// Enum Types
export enum BetType {
  Straight = "Straight",
  Split = "Split",
  Street = "Street",
  Corner = "Corner",
  SixLine = "SixLine",
  Red = "Red",
  Black = "Black",
  Even = "Even",
  Odd = "Odd",
  Low = "Low",
  High = "High",
  FirstTwelve = "FirstTwelve",
  SecondTwelve = "SecondTwelve",
  ThirdTwelve = "ThirdTwelve",
  FirstColumn = "FirstColumn",
  SecondColumn = "SecondColumn",
  ThirdColumn = "ThirdColumn",
}

export enum RouletteState {
  Created = "Created",
  Open = "Open",
  Locked = "Locked",
  Spinning = "Spinning",
  AwaitingRandomness = "AwaitingRandomness",
  Completed = "Completed",
  Expired = "Expired",
  Cancelled = "Cancelled",
}

export enum RouletteType {
  European = "European",
  American = "American",
}

// Simplified type export - full IDL types will be generated separately
export type Decentralized_rouletteProgram = Program<any>;