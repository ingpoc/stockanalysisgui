import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram, TransactionSignature } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount
} from '@solana/spl-token'
import {
  LotteryType as ProgramLotteryType,
  LotteryState as ProgramLotteryState,
  LotteryAccount,
  GlobalConfig,
  PROGRAM_ID,
  formatUSDC,
  parseUSDC,
  formatTimestamp,
  LotteryInfo
} from '@/types/lottery_types'
// Import the UI types for compatibility

// Import the IDL
import { DecentralizedLottery as ProgramIDL } from '@/types/decentralized_lottery'
const IDL = require('./decentralized_lottery.json') as ProgramIDL & Idl

type ProgramType = Program<ProgramIDL>

export class LotteryProgram {
  private program: ProgramType
  private connection: Connection
  private wallet: AnchorWallet

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

  async initialize(usdcMint: PublicKey, treasuryTokenAccount: PublicKey): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    const [globalConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_config")],
      this.program.programId
    );

    return await this.program.methods
      .initialize()
      .accounts({
        globalConfig: globalConfig,
        admin: this.program.provider.publicKey,
        usdcMint: usdcMint,
        treasuryTokenAccount: treasuryTokenAccount,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()
  }

  async createLottery(
    lotteryType: ProgramLotteryType,
    ticketPrice: number,
    drawTime: number,
    targetPrizePool: number = 0
  ): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    // Convert values to appropriate units (USDC has 6 decimals)
    const ticketPriceInSmallestUnit = Math.floor(ticketPrice * 1_000_000);
    const targetPrizePoolInSmallestUnit = Math.floor(targetPrizePool * 1_000_000);

    const [globalConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_config")],
      this.program.programId
    );

    const [lotteryAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("lottery")],
      this.program.programId
    );

    // Convert lottery type to enum format
    let lotteryTypeEnum: any;
    switch (lotteryType) {
      case 'Daily':
        lotteryTypeEnum = { daily: {} };
        break;
      case 'Weekly':
        lotteryTypeEnum = { weekly: {} };
        break;
      case 'Monthly':
        lotteryTypeEnum = { monthly: {} };
        break;
      default:
        throw new Error('Invalid lottery type');
    }

    return await this.program.methods
      .createLottery(
        lotteryTypeEnum,
        new BN(ticketPriceInSmallestUnit),
        new BN(drawTime),
        new BN(targetPrizePoolInSmallestUnit)
      )
      .accounts({
        lotteryAccount,
        globalConfig,
        creator: this.program.provider.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()
  }

  async buyTicket(lotteryAddress: string): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    const lotteryPubkey = new PublicKey(lotteryAddress);
    
    // Get lottery account to determine next ticket ID
    const lotteryAccount = await this.program.account.lotteryAccount.fetch(lotteryPubkey) as any;
    const nextTicketId = parseInt(lotteryAccount.lastTicketId) + 1;

    const [ticketAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("ticket"),
        lotteryPubkey.toBuffer(),
        Buffer.from(nextTicketId.toString().padStart(8, '0'))
      ],
      this.program.programId
    );

    const [globalConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_config")],
      this.program.programId
    );
    
    // Get global config to fetch USDC mint
    const globalConfigAccount = await this.program.account.globalConfig.fetch(globalConfig) as any;
    const usdcMint = new PublicKey(globalConfigAccount.usdcMint);
    
    // Get user's USDC token account
    const userTokenAccount = await this.getOrCreateAssociatedTokenAccount(
      usdcMint,
      this.program.provider.publicKey
    );
    
    // Get lottery's USDC token account
    const lotteryTokenAccount = await this.getOrCreateAssociatedTokenAccount(
      usdcMint,
      lotteryPubkey
    );

    return await this.program.methods
      .buyTicket()
      .accounts({
        lotteryAccount: lotteryPubkey,
        ticketAccount,
        globalConfig,
        user: this.program.provider.publicKey,
        userTokenAccount,
        lotteryTokenAccount, 
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()
  }

  async transitionState(lotteryPubkey: PublicKey, nextState: ProgramLotteryState): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    const [globalConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_config")],
      this.program.programId
    );

    // Convert state to enum format
    let stateEnum: any;
    switch (nextState) {
      case 'Created':
        stateEnum = { created: {} };
        break;
      case 'Open':
        stateEnum = { open: {} };
        break;
      case 'Locked':
        stateEnum = { locked: {} };
        break;
      case 'Drawing':
        stateEnum = { drawing: {} };
        break;
      case 'AwaitingRandomness':
        stateEnum = { awaitingRandomness: {} };
        break;
      case 'Completed':
        stateEnum = { completed: {} };
        break;
      case 'Expired':
        stateEnum = { expired: {} };
        break;
      case 'Cancelled':
        stateEnum = { cancelled: {} };
        break;
      default:
        throw new Error('Invalid lottery state');
    }

    return await this.program.methods
      .transitionState(stateEnum)
      .accounts({
        lotteryAccount: lotteryPubkey,
        globalConfig,
        admin: this.program.provider.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()
  }

  async selectWinner(lotteryPubkey: PublicKey): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    const [globalConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_config")],
      this.program.programId
    );

    return await this.program.methods
      .selectWinner()
      .accounts({
        lotteryAccount: lotteryPubkey,
        globalConfig,
        admin: this.program.provider.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()
  }

  async claimPrize(lotteryPubkey: PublicKey, ticketPubkey: PublicKey): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    const [globalConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_config")],
      this.program.programId
    );

    return await this.program.methods
      .claimPrize()
      .accounts({
        lotteryAccount: lotteryPubkey,
        ticketAccount: ticketPubkey,
        globalConfig,
        winner: this.program.provider.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()
  }

  async getLotteries(): Promise<LotteryInfo[]> {
    // Get all lottery accounts
    const lotteryAccounts = await this.program.account.lotteryAccount.all();
    
    return lotteryAccounts.map(account => {
      const data = account.account as any;
      
      // Convert from program data to UI-friendly format
      const lotteryTypeFromProgram = this.convertLotteryType(data.lotteryType);
      const stateFromProgram = this.convertLotteryState(data.state);
      
      return {
        address: account.publicKey.toString(),
        lotteryType: lotteryTypeFromProgram,
        ticketPrice: parseInt(data.ticketPrice) / 1_000_000, // Convert from smallest unit
        drawTime: parseInt(data.drawTime),
        prizePool: parseInt(data.prizePool) / 1_000_000, // Convert from smallest unit
        totalTickets: parseInt(data.totalTickets),
        state: stateFromProgram,
        createdBy: data.createdBy.toString(),
        globalConfig: data.globalConfig.toString(),
        winningNumbers: data.winningNumbers ? data.winningNumbers.toString() : null,
        targetPrizePool: parseInt(data.targetPrizePool) / 1_000_000, // Convert from smallest unit
      };
    });
  }

  async isProgramInitialized(): Promise<boolean> {
    try {
      const [globalConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from("global_config")],
        this.program.programId
      );

      await this.program.account.globalConfig.fetch(globalConfig);
      return true;
    } catch (error) {
      return false;
    }
  }

  private convertLotteryType(type: any): ProgramLotteryType {
    if ('daily' in type) return 'Daily';
    if ('weekly' in type) return 'Weekly';
    if ('monthly' in type) return 'Monthly';
    throw new Error('Unknown lottery type');
  }

  private convertLotteryState(state: any): ProgramLotteryState {
    if ('created' in state) return 'Created';
    if ('open' in state) return 'Open';
    if ('locked' in state) return 'Locked';
    if ('drawing' in state) return 'Drawing';
    if ('awaitingRandomness' in state) return 'AwaitingRandomness';
    if ('completed' in state) return 'Completed';
    if ('expired' in state) return 'Expired';
    if ('cancelled' in state) return 'Cancelled';
    throw new Error('Unknown lottery state');
  }

  private async getOrCreateAssociatedTokenAccount(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
    const associatedTokenAddress = await getAssociatedTokenAddress(mint, owner);
    
    try {
      // Try to get the account info
      await getAccount(this.connection, associatedTokenAddress);
      return associatedTokenAddress;
    } catch (error) {
      // Account doesn't exist, we need to create it
      // In a real implementation, you'd need to add this instruction to your transaction
      // For now, just return the address - the Anchor program should handle creation
      return associatedTokenAddress;
    }
  }

  static formatError(error: any): string {
    if (error.code && error.code >= 6000) {
      // Program errors
      const programErrorCodes: { [key: number]: string } = {
        6000: "Lottery type not supported",
        6001: "Invalid ticket price",
        6002: "Invalid prize pool",
        6003: "Lottery draw time invalid",
        6004: "Ticket purchase amount invalid",
        6005: "Ticket purchase limit reached",
        6006: "Lottery is not open",
        6007: "Lottery is drawing",
        6008: "Lottery is completed",
        6009: "Lottery is expired",
        6010: "Invalid lottery state",
        6011: "Invalid account owner",
        6012: "Invalid instruction input",
        6013: "Safe Math Error",
        6014: "Prize claim time expired",
        6015: "Invalid prize tier",
        6016: "Treasury withdrawal time lock not yet reached",
        6017: "Invalid treasury multisig",
        6018: "Token transfer failed",
        6019: "Invalid token account",
        6020: "Oracle price feed error",
        6021: "Randomness generation failed",
        6022: "Unauthorized access",
        6023: "Invalid state transition",
        6024: "Lottery cannot be cancelled in current state",
        6025: "Only admin can perform this action",
        6026: "Lottery is cancelled",
        6027: "Lottery is not open for ticket purchases",
        6028: "Lottery prize has already been claimed",
        6029: "Failed to derive PDA",
        6030: "Provided ticket PDA does not match the winning ticket stored in the lottery",
        6031: "The provided ticket has already been claimed or refunded",
        6032: "Lottery is not in a state where refunds can be claimed (must be Cancelled or Expired)"
      };
      
      return programErrorCodes[error.code] || `Program error ${error.code}`;
    }

    if (error.message) {
      return error.message;
    }

    return "Unknown error occurred";
  }
} 