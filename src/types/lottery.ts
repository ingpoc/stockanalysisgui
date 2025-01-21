import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

export enum LotteryType {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly'
}

export enum LotteryStatus {
  Active = 'Active',
  Completed = 'Completed'
}

export interface PlayerTicket {
  player: PublicKey
  ticketId: BN
}

export interface LotteryAccountData {
  authority: PublicKey
  pot: BN
  players: PlayerTicket[]
  winner: PublicKey | null
  lotteryType: LotteryType
  ticketPrice: BN
  startTime: BN
  endTime: BN
  status: LotteryStatus
  lastTicketId: BN
}

export interface LotteryAccount extends LotteryAccountData {
  publicKey: PublicKey
} 