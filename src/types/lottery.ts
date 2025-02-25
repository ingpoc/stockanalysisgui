import { PublicKey } from '@solana/web3.js'

export type LotteryTypeValue = 
  | { daily: Record<string, never> }
  | { weekly: Record<string, never> }
  | { monthly: Record<string, never> }

export type LotteryStateValue = 
  | { created: Record<string, never> }
  | { open: Record<string, never> }
  | { drawing: Record<string, never> }
  | { completed: Record<string, never> }
  | { expired: Record<string, never> }

export enum LotteryType {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly'
}

export enum LotteryState {
  Created = 'created',
  Open = 'open',
  Drawing = 'drawing',
  Completed = 'completed',
  Expired = 'expired',
  Cancelled = 'cancelled'
}

export interface GlobalConfig {
  treasury: PublicKey
  treasuryFeePercentage: number
  admin: PublicKey
  usdcMint: PublicKey
}

export interface LotteryAccount {
  lotteryType: LotteryTypeValue
  ticketPrice: bigint
  drawTime: bigint
  prizePool: bigint
  totalTickets: bigint
  winningNumbers: Buffer | null
  state: LotteryStateValue
  createdBy: PublicKey
  globalConfig: PublicKey
  targetPrizePool?: bigint
}

export interface LotteryInfo {
  address: string
  lotteryType: LotteryType
  ticketPrice: number
  drawTime: number
  prizePool: number
  totalTickets: number
  state: LotteryState
  createdBy: string
  globalConfig: string
  winningNumbers: string | null
  targetPrizePool?: number
} 