import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram, TransactionSignature } from '@solana/web3.js'
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
  private wallet: AnchorWallet
  private subscriptions: number[] = []

  constructor(connection: Connection, wallet: AnchorWallet) {
    this.connection = connection
    this.wallet = wallet
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
    let lotteryTypeValue: LotteryTypeValue;
    let lotteryTypeString: string;
    
    switch (type) {
      case LotteryType.Daily:
        lotteryTypeValue = { daily: {} };
        lotteryTypeString = 'daily';
        break;
      case LotteryType.Weekly:
        lotteryTypeValue = { weekly: {} };
        lotteryTypeString = 'weekly';
        break;
      case LotteryType.Monthly:
        lotteryTypeValue = { monthly: {} };
        lotteryTypeString = 'monthly';
        break;
      default:
        throw new Error('Invalid lottery type');
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
      lotteryAccount.globalConfig
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
    try {
      const accounts = await this.program.account.lotteryAccount.all()
      console.log('Raw accounts from program:', accounts)

      return await Promise.all(accounts.map(async ({ publicKey, account }: any) => {
        try {
          // Fetch the account data directly to ensure we have fresh data
          const accountData = await this.program.account.lotteryAccount.fetch(publicKey)
          console.log('Account data for', publicKey.toString(), ':', accountData)

          // Safely extract lottery type
          let lotteryType: LotteryType
          try {
            lotteryType = this.getLotteryTypeFromAccount(accountData.lotteryType)
          } catch (error) {
            console.error('Error parsing lottery type:', error)
            lotteryType = LotteryType.Daily // Default to daily if parsing fails
          }

          // Safely extract lottery state
          let state: LotteryState
          try {
            state = this.getLotteryStateFromAccount(accountData.state)
          } catch (error) {
            console.error('Error parsing lottery state:', error)
            state = LotteryState.Created // Default to created if parsing fails
          }

          // Convert BigInts to numbers safely
          const toBigIntSafe = (value: any) => {
            try {
              return typeof value === 'bigint' ? Number(value) : 
                     typeof value === 'number' ? value :
                     Number(value.toString())
            } catch {
              return 0
            }
          }

          return {
            address: publicKey.toString(),
            lotteryType,
            ticketPrice: toBigIntSafe(accountData.ticketPrice),
            drawTime: toBigIntSafe(accountData.drawTime),
            prizePool: toBigIntSafe(accountData.prizePool),
            totalTickets: toBigIntSafe(accountData.totalTickets),
            state,
            createdBy: accountData.createdBy.toString(),
            globalConfig: accountData.globalConfig.toString(),
            winningNumbers: accountData.winningNumbers ? 
              Buffer.from(accountData.winningNumbers).toString('hex') : null
          }
        } catch (error) {
          console.error('Error processing lottery account:', publicKey.toString(), error)
          return null
        }
      })).then(results => results.filter((result): result is LotteryInfo => result !== null))
    } catch (error) {
      console.error('Error fetching lottery accounts:', error)
      throw error
    }
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
            lotteryType: this.getLotteryTypeFromAccount(decodedAccount.lotteryType),
            ticketPrice: Number(decodedAccount.ticketPrice),
            drawTime: Number(decodedAccount.drawTime),
            prizePool: Number(decodedAccount.prizePool),
            totalTickets: Number(decodedAccount.totalTickets),
            state: this.getLotteryStateFromAccount(decodedAccount.state),
            createdBy: decodedAccount.createdBy.toString(),
            globalConfig: decodedAccount.globalConfig.toString(),
            winningNumbers: decodedAccount.winningNumbers ? Buffer.from(decodedAccount.winningNumbers).toString('hex') : null
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

  private getLotteryTypeFromAccount(type: any): LotteryType {
    if (!type || typeof type !== 'object') {
      throw new Error('Invalid lottery type: type is null or undefined')
    }

    // Log the type for debugging
    console.log('Raw lottery type from account:', type)

    // Handle Anchor enum format
    try {
      // The type might be coming as { [key: string]: {} }
      // or as a discriminated object from Anchor
      if (type.daily) return LotteryType.Daily
      if (type.weekly) return LotteryType.Weekly
      if (type.monthly) return LotteryType.Monthly

      // If not found in direct properties, try to parse the Anchor format
      const enumValue = type.toString()
      if (enumValue.includes('daily')) return LotteryType.Daily
      if (enumValue.includes('weekly')) return LotteryType.Weekly
      if (enumValue.includes('monthly')) return LotteryType.Monthly

      throw new Error(`Invalid lottery type format: ${JSON.stringify(type)}`)
    } catch (error) {
      console.error('Error parsing lottery type:', error)
      throw new Error(`Failed to parse lottery type: ${JSON.stringify(type)}`)
    }
  }

  private getLotteryStateFromAccount(state: any): LotteryState {
    if (!state || typeof state !== 'object') {
      throw new Error('Invalid lottery state: state is null or undefined')
    }

    // Log the state for debugging
    console.log('Raw lottery state from account:', state)

    try {
      // Handle direct property access
      if (state.created) return LotteryState.Created
      if (state.open) return LotteryState.Open
      if (state.drawing) return LotteryState.Drawing
      if (state.completed) return LotteryState.Completed
      if (state.expired) return LotteryState.Expired

      // Try to parse the Anchor format
      const stateValue = state.toString()
      if (stateValue.includes('created')) return LotteryState.Created
      if (stateValue.includes('open')) return LotteryState.Open
      if (stateValue.includes('drawing')) return LotteryState.Drawing
      if (stateValue.includes('completed')) return LotteryState.Completed
      if (stateValue.includes('expired')) return LotteryState.Expired

      throw new Error(`Invalid lottery state format: ${JSON.stringify(state)}`)
    } catch (error) {
      console.error('Error parsing lottery state:', error)
      throw new Error(`Failed to parse lottery state: ${JSON.stringify(state)}`)
    }
  }

  private findLotteryTokenAccountPDA(lotteryPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('lottery_token'), lotteryPubkey.toBuffer()],
      this.program.programId
    );
  }

  private findGlobalConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('global_config')],
      this.program.programId
    );
  }

  async getLotteryAccount(lotteryPubkey: PublicKey) {
    return await this.program.account.lotteryAccount.fetch(lotteryPubkey);
  }

  // Convert frontend state enum to program state enum
  private getProgramLotteryState(state: LotteryState): any {
    const stateMap = {
      [LotteryState.Created]: { created: {} },
      [LotteryState.Open]: { open: {} },
      [LotteryState.Drawing]: { drawing: {} },
      [LotteryState.Completed]: { completed: {} },
      [LotteryState.Expired]: { expired: {} },
      [LotteryState.Cancelled]: { cancelled: {} },
    };
    return stateMap[state];
  }

  async transitionState(
    lotteryPubkey: PublicKey,
    nextState: LotteryState
  ): Promise<TransactionSignature> {
    try {
      const lotteryAccount = await this.getLotteryAccount(lotteryPubkey);
      const [lotteryTokenAccount] = this.findLotteryTokenAccountPDA(lotteryPubkey);
      const [globalConfig] = this.findGlobalConfigPDA();

      return await this.program.methods
        .transitionState(this.getProgramLotteryState(nextState))
        .accounts({
          lotteryAccount: lotteryPubkey,
          globalConfig,
          lotteryTokenAccount,
          admin: this.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any) // Use type assertion to handle Anchor's account naming mismatch
        .rpc();
    } catch (error) {
      console.error('Error transitioning state:', error);
      throw error;
    }
  }
} 