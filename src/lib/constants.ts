/**
 * Application Constants
 * 
 * This file centralizes all constants and environment variables used throughout the application.
 * Always use these constants instead of directly accessing process.env to ensure consistency
 * and make it easier to update values in the future.
 */

// Blockchain Configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
export const SOLANA_DEVNET_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com'
export const SOLANA_MAINNET_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com'

// Lottery Program Configuration
export const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '7Q3UBDfjZgNJNCQBdJrji33f2FvtJ1z3DErcAV6hFsf4'
export const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || ADMIN_WALLET
export const LOTTERY_PROGRAM_ID = process.env.NEXT_PUBLIC_LOTTERY_PROGRAM_ID || 'F1pffGp4n5qyNRcCnpoTH5CEfVKQEGxAxmRuRScUw4tz'
export const USDC_MINT = process.env.NEXT_PUBLIC_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
export const GLOBAL_CONFIG_SEED = process.env.NEXT_PUBLIC_GLOBAL_CONFIG_SEED || 'global_config'
export const LOTTERY_SEED = process.env.NEXT_PUBLIC_LOTTERY_SEED || 'lottery'
export const LOTTERY_TOKEN_SEED = process.env.NEXT_PUBLIC_LOTTERY_TOKEN_SEED || 'lottery_token'

// Application Configuration
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
export const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || ''

// Feature Flags
export const ENABLE_CRYPTO_LOTTERY = process.env.NEXT_PUBLIC_ENABLE_CRYPTO_LOTTERY === 'true' 