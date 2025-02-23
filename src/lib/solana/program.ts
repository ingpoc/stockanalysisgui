import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount
} from '@solana/spl-token'
import { 
  LotteryType, 
  LotteryState, 
  LotteryInfo, 
  LotteryAccount,
  LotteryTypeValue,
  LotteryStateValue,
  GlobalConfig
} from '@/types/lottery'

import { DecentralizedLottery as ProgramIDL } from '@/types/lottery_types'
const IDL = require('./decentralized_lottery.json') as ProgramIDL & Idl

const PROGRAM_ID = new PublicKey('7MTSfGTiXNH4ZGztQPdvzpkKivUEUzQhJvsccJFDEMyt')
const GLOBAL_CONFIG_SEED = 'global_config'
const LOTTERY_SEED = 'lottery'

type ProgramType = Program<ProgramIDL>

export class LotteryProgram {
  private program: ProgramType
  private connection: Connection
  private subscriptions: number[] = []

  constructor(connection: Connection, wallet: AnchorWallet) {
    this.connection = connection
    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    )
    this.program = new Program(
      IDL,
      provider
    ) as ProgramType
  }

  async initialize(usdcMint: PublicKey) {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    // Get global config PDA
    const [globalConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_CONFIG_SEED)],
      this.program.programId
    )

    return await this.program.methods
      .initialize()
      .accounts({
        globalConfig: globalConfig,
        admin: this.program.provider.publicKey,
        usdcMint: usdcMint,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()
  }

  async createLottery(
    type: LotteryType,
    ticketPrice: number,
    drawTime: number,
    prizePool: number
  ) {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    // Get global config PDA
    const [globalConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_CONFIG_SEED)],
      this.program.programId
    )

    // Create the lottery type enum value and corresponding string for PDA seed
    let lotteryTypeValue;
    let lotteryTypeString;
    if (type === LotteryType.Daily) {
      lotteryTypeValue = { daily: {} };
      lotteryTypeString = 'daily';
    } else if (type === LotteryType.Weekly) {
      lotteryTypeValue = { weekly: {} };
      lotteryTypeString = 'weekly';
    } else {
      lotteryTypeValue = { monthly: {} };
      lotteryTypeString = 'monthly';
    }

    // Get lottery account PDA using the explicit lotteryTypeString
    const [lotteryAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(LOTTERY_SEED),
        Buffer.from(lotteryTypeString),
        new BN(drawTime).toArrayLike(Buffer, 'le', 8)
      ],
      this.program.programId
    )

    return await this.program.methods
      .createLottery(
        lotteryTypeValue,
        new BN(ticketPrice),
        new BN(drawTime),
        new BN(prizePool)
      )
      .accounts({
        lotteryAccount: lotteryAccount,
        creator: this.program.provider.publicKey,
        globalConfig: globalConfig,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()
  }

  async buyTicket(lotteryAddress: string, numberOfTickets: number) {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    const lotteryAccountKey = new PublicKey(lotteryAddress)
    const lotteryAccount = await this.program.account.lotteryAccount.fetch(
      lotteryAccountKey
    ) as unknown as LotteryAccount

    const globalConfig = await this.program.account.globalConfig.fetch(
      lotteryAccount.global_config
    ) as unknown as GlobalConfig

    // Get user's USDC token account
    const userTokenAccount = await getAssociatedTokenAddress(
      globalConfig.usdcMint,
      this.program.provider.publicKey
    )

    // Get lottery's USDC token account
    const lotteryTokenAccount = await getAssociatedTokenAddress(
      globalConfig.usdcMint,
      lotteryAccountKey,
      true // allowOwnerOffCurve = true for PDA
    )

    // Check if user's token account exists, if not create it
    try {
      await getAccount(this.connection, userTokenAccount)
    } catch (error) {
      const createAtaIx = createAssociatedTokenAccountInstruction(
        this.program.provider.publicKey,
        userTokenAccount,
        this.program.provider.publicKey,
        globalConfig.usdcMint
      )
      const tx = await this.program.methods
        .buyTicket(new BN(numberOfTickets))
        .accounts({
          lotteryAccount: lotteryAccount,
          userTokenAccount: userTokenAccount,
          lotteryTokenAccount: lotteryTokenAccount,
          buyer: this.program.provider.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .preInstructions([createAtaIx])
        .rpc()
      return tx
    }

    return await this.program.methods
      .buyTicket(new BN(numberOfTickets))
      .accounts({
        lotteryAccount: lotteryAccountKey,
        userTokenAccount: userTokenAccount,
        lotteryTokenAccount: lotteryTokenAccount,
        buyer: this.program.provider.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc()
  }

  async getLotteries(): Promise<LotteryInfo[]> {
    const accounts = await this.program.account.lotteryAccount.all()
    return accounts.map(({ publicKey, account }: any) => ({
      address: publicKey.toString(),
      lotteryType: this.getLotteryTypeFromAccount(account.lottery_type),
      ticketPrice: Number(account.ticket_price),
      drawTime: Number(account.draw_time),
      prizePool: Number(account.prize_pool),
      totalTickets: Number(account.total_tickets),
      state: this.getLotteryStateFromAccount(account.state),
      createdBy: account.created_by.toString(),
      globalConfig: account.global_config.toString(),
      winningNumbers: account.winning_numbers ? Buffer.from(account.winning_numbers).toString('hex') : null
    }))
  }

  async subscribeToLotteryChanges(
    lotteryAddress: string,
    callback: (lottery: LotteryInfo) => void
  ): Promise<number> {
    const subscription = this.connection.onAccountChange(
      new PublicKey(lotteryAddress),
      async (accountInfo) => {
        try {
          const decodedAccount = this.program.coder.accounts.decode(
            'LotteryAccount',
            accountInfo.data
          ) as unknown as LotteryAccount
          callback({
            address: lotteryAddress,
            lotteryType: this.getLotteryTypeFromAccount(decodedAccount.lottery_type),
            ticketPrice: Number(decodedAccount.ticket_price),
            drawTime: Number(decodedAccount.draw_time),
            prizePool: Number(decodedAccount.prize_pool),
            totalTickets: Number(decodedAccount.total_tickets),
            state: this.getLotteryStateFromAccount(decodedAccount.state),
            createdBy: decodedAccount.created_by.toString(),
            globalConfig: decodedAccount.global_config.toString(),
            winningNumbers: decodedAccount.winning_numbers ? Buffer.from(decodedAccount.winning_numbers).toString('hex') : null
          })
        } catch (error) {
          console.error('Error decoding lottery account:', error)
        }
      }
    )
    this.subscriptions.push(subscription)
    return subscription
  }

  unsubscribe(subscription: number) {
    this.connection.removeAccountChangeListener(subscription)
    this.subscriptions = this.subscriptions.filter(sub => sub !== subscription)
  }

  unsubscribeAll() {
    this.subscriptions.forEach(sub => this.connection.removeAccountChangeListener(sub))
    this.subscriptions = []
  }

  // Helper method to validate lottery state
  async validateLotteryState(lotteryAddress: string): Promise<boolean> {
    try {
      const account = await this.program.account.lotteryAccount.fetch(
        new PublicKey(lotteryAddress)
      ) as unknown as LotteryAccount
      return this.getLotteryStateFromAccount(account.state) === LotteryState.Open
    } catch (error) {
      console.error('Error validating lottery state:', error)
      return false
    }
  }

  // Helper method to format errors
  static formatError(error: any): string {
    if (error.code) {
      switch (error.code) {
        case 6000:
          return 'Lottery type not supported'
        case 6001:
          return 'Invalid ticket price'
        case 6002:
          return 'Invalid prize pool'
        case 6003:
          return 'Lottery draw time invalid'
        case 6004:
          return 'Ticket purchase amount invalid'
        case 6005:
          return 'Ticket purchase limit reached'
        case 6006:
          return 'Lottery is not open'
        case 6007:
          return 'Lottery is drawing'
        case 6008:
          return 'Lottery is completed'
        case 6009:
          return 'Lottery is expired'
        case 6010:
          return 'Invalid lottery state'
        case 6011:
          return 'Invalid account owner'
        case 6012:
          return 'Invalid instruction input'
        case 6013:
          return 'Safe math error'
        case 6018:
          return 'Token transfer failed'
        case 6019:
          return 'Invalid token account'
        default:
          return 'An unexpected error occurred'
      }
    }
    return error.message || 'An unexpected error occurred'
  }

  private getLotteryTypeFromAccount(type: LotteryTypeValue): LotteryType {
    const key = Object.keys(type)[0] as keyof typeof type
    switch (key) {
      case 'daily': return LotteryType.Daily
      case 'weekly': return LotteryType.Weekly
      case 'monthly': return LotteryType.Monthly
      default: throw new Error('Invalid lottery type')
    }
  }

  private getLotteryStateFromAccount(state: LotteryStateValue): LotteryState {
    const key = Object.keys(state)[0] as keyof typeof state
    switch (key) {
      case 'created': return LotteryState.Created
      case 'open': return LotteryState.Open
      case 'drawing': return LotteryState.Drawing
      case 'completed': return LotteryState.Completed
      case 'expired': return LotteryState.Expired
      default: throw new Error('Invalid lottery state')
    }
  }
} 