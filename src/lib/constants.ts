/**
 * Application Constants
 * 
 * Static values that never change between environments.
 * Environment variables are accessed directly via process.env.
 */

// Environment Variables (from .env.local)
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK!
export const LOTTERY_PROGRAM_ID = process.env.NEXT_PUBLIC_LOTTERY_PROGRAM_ID!
export const ROULETTE_PROGRAM_ID = process.env.NEXT_PUBLIC_ROULETTE_PROGRAM_ID!
export const USDC_MINT = process.env.NEXT_PUBLIC_USDC_MINT!
export const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET!
export const TREASURY_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET! // Treasury is same as admin wallet
export const GLOBAL_CONFIG_SEED = process.env.NEXT_PUBLIC_GLOBAL_CONFIG_SEED!
export const ROULETTE_GLOBAL_CONFIG_SEED = process.env.NEXT_PUBLIC_ROULETTE_GLOBAL_CONFIG_SEED!
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!

// PDA Seeds (static, never change)
export const LOTTERY_SEED = 'lottery'
export const LOTTERY_TOKEN_SEED = 'lottery_token'
export const ROULETTE_SEED = 'roulette'
export const ROULETTE_BET_SEED = 'bet'
export const ROULETTE_TOKEN_SEED = 'roulette_token'
export const TICKET_SEED = 'ticket'

// Token Configuration
export const USDC_DECIMALS = 6

// UI Constants
export const DEFAULT_THEME = 'light'
export const ANIMATION_DURATION = 300

// Business Logic Constants
export const MIN_TICKET_PRICE = 0.1 // USDC
export const MAX_TICKET_PRICE = 1000 // USDC
export const MIN_BET_AMOUNT = 0.01 // USDC
export const MAX_BET_AMOUNT = 10000 // USDC

// State Transitions
export const VALID_LOTTERY_STATES = [
  'Created',
  'Open', 
  'Locked',
  'Drawing',
  'AwaitingRandomness',
  'Completed',
  'Expired',
  'Cancelled'
] as const

export const VALID_ROULETTE_STATES = [
  'Created',
  'Open',
  'Locked', 
  'Spinning',
  'AwaitingRandomness',
  'Completed',
  'Expired',
  'Cancelled'
] as const

// Feature Flags (static)
export const ENABLE_CRYPTO_LOTTERY = true
export const ENABLE_ROULETTE = true

// Network Constants
export const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com'
export const SOLANA_MAINNET_RPC = 'https://api.mainnet-beta.solana.com'

// Time Constants  
export const SECONDS_PER_DAY = 24 * 60 * 60
export const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY
export const SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY