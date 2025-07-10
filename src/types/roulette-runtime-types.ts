/**
 * Runtime-compatible Roulette Types
 *
 * These types match how Anchor actually transforms field names at runtime (camelCase)
 * despite the IDL showing snake_case field names.
 */

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// Re-export enums from enhanced types (these are correct)
export { BetType, RouletteState, RouletteType } from './enhanced-types';

// Runtime-compatible RouletteAccount interface (camelCase fields)
export interface RouletteAccount {
  rouletteType: any; // RouletteType enum
  minBet: BN;
  maxBet: BN;
  gameDuration: BN;
  bettingDuration: BN;
  startTime: BN;
  bettingEndTime: BN;
  spinTime: BN;
  revealTime: BN;
  endTime: BN;
  state: any; // RouletteState enum
  totalBets: BN;
  totalBetAmount: BN;
  totalPlayers: BN;
  winningNumber: number | null;
  lastBetId: BN;
  createdBy: PublicKey;
  authority: PublicKey;
  globalConfig: PublicKey;
  vrfClient: PublicKey | null;
  vrfRandomness: number[] | null;
  vrfRequestKey: PublicKey | null;
  randomnessFulfilled: boolean;
  totalPayouts: BN;
  houseEdgeCollected: BN;
  treasuryFeeCollected: BN;
  isSettled: boolean;
  createdAt: BN;
  completedAt: BN | null;
  nonce: BN;
  bump: number;
}

// Runtime-compatible BetAccount interface (camelCase fields)
export interface BetAccount {
  roulette: PublicKey;
  betId: BN;
  bettor: PublicKey;
  betType: any; // BetType enum
  betAmount: BN;
  betNumbers: Uint8Array;
  payoutMultiplier: number;
  isWinner: boolean;
  payoutAmount: BN;
  claimedAt: BN | null;
  createdAt: BN;
  bump: number;
}

// Runtime-compatible GlobalConfig interface (camelCase fields)
export interface GlobalConfig {
  authority: PublicKey;
  usdcMint: PublicKey;
  treasuryTokenAccount: PublicKey;
  treasuryFeePercentage: number;
  minGameDuration: BN;
  maxGameDuration: BN;
  isPaused: boolean;
  createdAt: BN;
  bump: number;
}

// UI-friendly transformed types
export interface RouletteDisplay {
  publicKey: string;
  rouletteType: string;
  minBet: number;
  maxBet: number;
  gameDuration: number;
  bettingDuration: number;
  startTime: number;
  bettingEndTime: number;
  spinTime: number;
  revealTime: number;
  endTime: number;
  state: string;
  totalBets: number;
  totalBetAmount: number;
  totalPlayers: number;
  winningNumber: number | null;
  lastBetId: number;
  createdBy: string;
  authority: string;
  globalConfig: string;
  vrfClient: string | null;
  vrfRandomness: number[] | null;
  vrfRequestKey: string | null;
  randomnessFulfilled: boolean;
  totalPayouts: number;
  houseEdgeCollected: number;
  treasuryFeeCollected: number;
  isSettled: boolean;
  createdAt: number;
  completedAt: number | null;
  nonce: number;
  bump: number;
}
