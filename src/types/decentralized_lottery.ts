import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

// Auto-generated types from IDL for decentralized_lottery
// SECURITY: Program ID updated based on network configuration
export const PROGRAM_ID = "BH1qtDhU6PtB1jrUJPf8JoNt34ELuTvVTDktDLFyq2JV"; // Localnet ID

// Account Types
export interface GlobalConfig {
  admin: PublicKey;
  treasury_fee_percentage: number;
  usdc_mint: PublicKey;
  treasury_token_account: PublicKey;
}

export interface LotteryAccount {
  lottery_type: LotteryType;
  ticket_price: number;
  draw_time: number;
  prize_pool: number;
  total_tickets: number;
  winning_ticket: PublicKey | null;
  state: LotteryState;
  created_by: PublicKey;
  global_config: PublicKey;
  auto_transition: boolean;
  last_ticket_id: number;
  authority: PublicKey;
  vrf_client: PublicKey | null;
  vrf_randomness: number[] | null;
  vrf_request_account: PublicKey | null;
  oracle_pubkey: PublicKey | null;
  vrf_request_key: PublicKey | null;
  randomness_fulfilled: boolean;
  is_prize_pool_locked: boolean;
  target_prize_pool: number;
  is_claimed: boolean;
  created_at: number;
  completed_at: number | null;
  nonce: number;
}

export interface TicketAccount {
  lottery: PublicKey;
  id: number;
  buyer: PublicKey;
  is_claimed: boolean;
  bump: number;
}

// Enum Types
export enum LotteryState {
  Created = "Created",
  Open = "Open", 
  Locked = "Locked",
  Drawing = "Drawing",
  AwaitingRandomness = "AwaitingRandomness",
  Completed = "Completed",
  Expired = "Expired",
  Cancelled = "Cancelled",
}

export enum LotteryType {
  Daily = "Daily",
  Weekly = "Weekly", 
  Monthly = "Monthly",
}

// Simplified type export - full IDL types will be generated separately
export type Decentralized_lotteryProgram = Program<any>;