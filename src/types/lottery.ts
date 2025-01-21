export enum LotteryType {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly'
}

export enum LotteryStatus {
  Active = 'Active',
  Completed = 'Completed'
}

export interface LotteryInfo {
  address: string;
  authority: string;
  pot: number;
  ticketPrice: number;
  startTime: number;
  endTime: number;
  status: LotteryStatus;
  type: LotteryType;
  playerCount: number;
  winner?: string;
}

export interface PlayerTicket {
  player: string;
  ticketId: number;
} 