/**
 * Roulette Types
 * 
 * This file contains UI-friendly types, helpers, and utilities for the
 * decentralized roulette program.
 */

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// Import the main generated type
import type { DecentralizedRoulette } from './decentralized_roulette';

// Extract types from the IDL
type IdlAccounts = DecentralizedRoulette['accounts'];
type IdlTypes = DecentralizedRoulette['types'];

// Find specific account types by their name
type ExtractAccount<T extends { name: string }[], N extends string> = T extends readonly [...infer Rest, infer Last]
  ? Last extends { name: N }
    ? Last
    : ExtractAccount<Rest extends { name: string }[] ? Rest : [], N>
  : never;

type ExtractType<T extends { name: string }[], N extends string> = T extends readonly [...infer Rest, infer Last]
  ? Last extends { name: N }
    ? Last
    : ExtractType<Rest extends { name: string }[] ? Rest : [], N>
  : never;

// Export the extracted types
export type GlobalConfig = ExtractAccount<IdlAccounts, 'globalConfig'>;
export type RouletteAccount = ExtractAccount<IdlAccounts, 'rouletteAccount'>;
export type BetAccount = ExtractAccount<IdlAccounts, 'betAccount'>;
export type RouletteState = ExtractType<IdlTypes, 'RouletteState'>;
export type RouletteType = ExtractType<IdlTypes, 'RouletteType'>;
export type BetType = ExtractType<IdlTypes, 'BetType'>;

// Extended RouletteAccount type with computed fields
export interface RouletteAccountExtended {
  address: PublicKey;
  account: RouletteAccount;
  totalPlayers: number;
  totalBetAmount: number;
  winningNumber: number | null;
  state: string;
}

// ===== ROULETTE DISPLAY HELPERS =====

// Helper to get string representation of discriminated union state
export function getRouletteStateString(state: any): string {
  if (typeof state === 'object' && state) {
    return Object.keys(state)[0];
  }
  return String(state);
}

// Helper to get display name for state (capitalized)
export function getRouletteStateDisplayName(state: any): string {
  const stateStr = getRouletteStateString(state);
  return stateStr.charAt(0).toUpperCase() + stateStr.slice(1);
}

// Helper to check if state matches a specific value
export function isRouletteStateEqual(state: any, target: string): boolean {
  return getRouletteStateString(state).toLowerCase() === target.toLowerCase();
}

// Export the main type for compatibility
export type { DecentralizedRoulette };
