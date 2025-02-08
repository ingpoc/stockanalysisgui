import { PublicKey } from '@solana/web3.js'

export type LotteryTypeValue = {
  daily?: Record<string, never>
  weekly?: Record<string, never>
  monthly?: Record<string, never>
}

export type LotteryStateValue = {
  created?: Record<string, never>
  open?: Record<string, never>
  drawing?: Record<string, never>
  completed?: Record<string, never>
  expired?: Record<string, never>
}

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
  Expired = 'expired'
}

export interface GlobalConfig {
  treasury: PublicKey
  treasuryFeePercentage: number
  admin: PublicKey
  usdcMint: PublicKey
}

export interface LotteryAccount {
  lottery_type: LotteryTypeValue
  ticket_price: bigint
  draw_time: bigint
  prize_pool: bigint
  total_tickets: bigint
  winning_numbers: Buffer | null
  state: LotteryStateValue
  created_by: PublicKey
  global_config: PublicKey
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
} 