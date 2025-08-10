/**
 * Roulette Types
 *
 * This file contains UI-friendly types, helpers, and utilities for the
 * decentralized roulette program.
 */

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// Import the main generated type
import type { Decentralized_rouletteProgram } from './decentralized_roulette';

// Define account types as any for now to avoid type errors
export type RouletteAccount = any;
export type BetAccount = any;
export type GlobalConfig = any;

// Define state types
export type RouletteState =
  | { created: {} }
  | { open: {} }
  | { locked: {} }
  | { spinning: {} }
  | { awaitingRandomness: {} }
  | { completed: {} }
  | { expired: {} }
  | { cancelled: {} };

export type RouletteType = { european: {} } | { american: {} };

export type BetType =
  | { straight: {} }
  | { split: {} }
  | { street: {} }
  | { corner: {} }
  | { sixLine: {} }
  | { red: {} }
  | { black: {} }
  | { even: {} }
  | { odd: {} }
  | { low: {} }
  | { high: {} }
  | { firstTwelve: {} }
  | { secondTwelve: {} }
  | { thirdTwelve: {} }
  | { firstColumn: {} }
  | { secondColumn: {} }
  | { thirdColumn: {} };

// UI-friendly types
export interface UIRouletteState {
  state: RouletteState;
  totalBets: number;
  totalBetAmount: BN;
  totalPlayers: number;
  winningNumber?: number;
  isSpinning: boolean;
  isCompleted: boolean;
}

export interface UIBetDetails {
  betType: BetType;
  betAmount: BN;
  betNumbers: number[];
  payoutMultiplier: number;
  isWinner: boolean;
  payoutAmount?: BN;
}

// Helper type for the program
export type RouletteProgram = Decentralized_rouletteProgram;

// ===== DISPLAY & STATE HELPERS =====
export function getRouletteStateString(state: RouletteState | string): string {
  if (typeof state === 'string') return state;
  if (state && typeof state === 'object') {
    return Object.keys(state)[0];
  }
  return 'unknown';
}

export function getRouletteStateDisplayName(
  state: RouletteState | string
): string {
  const key = getRouletteStateString(state);
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function isRouletteStateEqual(
  state: RouletteState | string,
  target: string
): boolean {
  return getRouletteStateString(state).toLowerCase() === target.toLowerCase();
}