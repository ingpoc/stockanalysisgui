import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram, TransactionSignature, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount
} from '@solana/spl-token'
import { 
  DecentralizedRoulette as ProgramIDL,
} from '@/types/decentralized_roulette'
import {
  ROULETTE_PROGRAM_ID as PROGRAM_ID,
  USDC_MINT,
  ROULETTE_GLOBAL_CONFIG_SEED,
  ROULETTE_SEED,
  ROULETTE_BET_SEED,
  ROULETTE_TOKEN_SEED
} from '@/lib/constants'

// Import the IDL
const IDL = require('./decentralized_roulette.json') as ProgramIDL & Idl

// Extract types from the IDL
export type RouletteAccount = ProgramIDL['accounts'][0]
export type BetAccount = ProgramIDL['accounts'][1]
export type RouletteType = ProgramIDL['types'][0]
export type RouletteState = ProgramIDL['types'][1]
export type BetType = ProgramIDL['types'][2]

type ProgramType = Program<ProgramIDL>

// Program configuration
export const ROULETTE_PROGRAM_ID = new PublicKey(PROGRAM_ID)

// USDC mint addresses
export const USDC_MINT_ADDRESS = new PublicKey(USDC_MINT)
export const USDC_MINT_DEVNET = new PublicKey(USDC_MINT)

// Constants for game timing (in seconds)
export const BETTING_DURATION = 180 // 3 minutes
export const LOCK_DURATION = 30 // 30 seconds  
export const SPIN_DURATION = 30 // 30 seconds
export const REVEAL_DELAY = 60 // 1 minute

// PDA seeds
export const GLOBAL_CONFIG_SEED = ROULETTE_GLOBAL_CONFIG_SEED
export const ROULETTE_SEED_STRING = ROULETTE_SEED
export const BET_SEED = ROULETTE_BET_SEED
export const ROULETTE_TOKEN_SEED_STRING = ROULETTE_TOKEN_SEED

export class RouletteProgram {
  private program: ProgramType
  private connection: Connection
  private wallet: AnchorWallet
  public readonly programId = ROULETTE_PROGRAM_ID

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

  // Get the global config PDA
  getGlobalConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_CONFIG_SEED)],
      this.programId
    )
  }

  // Get roulette account PDA
  getRoulettePDA(creator: PublicKey, nonce: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(ROULETTE_SEED_STRING),
        creator.toBuffer(),
        new BN(nonce).toArrayLike(Buffer, "le", 8)
      ],
      this.programId
    )
  }

  // Get bet account PDA
  getBetPDA(roulette: PublicKey, bettor: PublicKey, betId: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(BET_SEED),
        roulette.toBuffer(),
        bettor.toBuffer(),
        new BN(betId).toArrayLike(Buffer, "le", 8)
      ],
      this.programId
    )
  }

  // Get roulette token account PDA
  getRouletteTokenPDA(roulette: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(ROULETTE_TOKEN_SEED_STRING),
        roulette.toBuffer()
      ],
      this.programId
    )
  }

  // Initialize the roulette program (admin only)
  async initialize(): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error('Wallet not connected')
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA()
    const usdcMint = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet' ? USDC_MINT_ADDRESS : USDC_MINT_DEVNET // Use devnet USDC for testing

    // Get treasury token account
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      globalConfigPDA,
      true // allowOwnerOffCurve
    )

    return await this.program.methods
      .initialize()
      .accounts({
        globalConfig: globalConfigPDA,
        authority: this.program.provider.publicKey,
        usdcMint: usdcMint,
        treasuryTokenAccount: treasuryTokenAccount,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()
  }

  // Create a new roulette game
  async createRoulette(
    rouletteType: RouletteType,
    minBet: number,
    maxBet: number,
    gameDuration: number,
    nonce: number
  ): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error('Wallet not connected')
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA()
    const [roulettePDA] = this.getRoulettePDA(this.program.provider.publicKey, nonce)
    const [rouletteTokenPDA] = this.getRouletteTokenPDA(roulettePDA)
    
    const usdcMint = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet' ? USDC_MINT_ADDRESS : USDC_MINT_DEVNET
    const creatorTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      this.program.provider.publicKey
    )

    // Convert enum to the format expected by the program
    const programRouletteType = (rouletteType as any).european 
      ? { european: {} } 
      : { american: {} }

    return await this.program.methods
      .createRoulette(
        programRouletteType,
        new BN(minBet),
        new BN(maxBet),
        new BN(gameDuration),
        new BN(nonce)
      )
      .accounts({
        roulette: roulettePDA,
        globalConfig: globalConfigPDA,
        creator: this.program.provider.publicKey,
        usdcMint: usdcMint,
        creatorTokenAccount: creatorTokenAccount,
        rouletteTokenAccount: rouletteTokenPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc()
  }

  // Place a bet on a roulette game
  async placeBet(
    roulette: PublicKey,
    betType: BetType,
    betAmount: number,
    betNumbers: number[]
  ): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error('Wallet not connected')
    }

    // Get current roulette state to determine bet ID
    // @ts-expect-error
    const rouletteAccount = await this.program.account["rouletteAccount"].fetch(roulette) as any
    const betId = rouletteAccount.total_bets.toNumber()

    const [globalConfigPDA] = this.getGlobalConfigPDA()
    const [betPDA] = this.getBetPDA(roulette, this.program.provider.publicKey, betId)
    const [rouletteTokenPDA] = this.getRouletteTokenPDA(roulette)
    
    const usdcMint = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet' ? USDC_MINT_ADDRESS : USDC_MINT_DEVNET
    const bettorTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      this.program.provider.publicKey
    )

    // Convert enum to the format expected by the program
    const programBetType = this.convertBetTypeToProgram(betType)

    return (this.program.methods as any)
      .placeBet(
        programBetType,
        new BN(betAmount),
        Buffer.from(betNumbers)
      )
      .accounts({
        roulette: roulette,
        bet: betPDA,
        globalConfig: globalConfigPDA,
        bettor: this.program.provider.publicKey,
        usdcMint: usdcMint,
        bettorTokenAccount: bettorTokenAccount,
        rouletteTokenAccount: rouletteTokenPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()
  }

  // Lock betting for a roulette game
  async lockBetting(roulette: PublicKey): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error('Wallet not connected')
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA()

    return await this.program.methods
      .lockBetting()
      .accounts({
        roulette: roulette,
        globalConfig: globalConfigPDA,
        caller: this.program.provider.publicKey,
      } as any)
      .rpc()
  }

  // Claim winnings from a bet
  async claimWinnings(
    roulette: PublicKey,
    bet: PublicKey
  ): Promise<TransactionSignature> {
    if (!this.program.provider.publicKey) {
      throw new Error('Wallet not connected')
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA()
    const [rouletteTokenPDA] = this.getRouletteTokenPDA(roulette)
    
    const usdcMint = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet' ? USDC_MINT_ADDRESS : USDC_MINT_DEVNET
    const claimerTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      this.program.provider.publicKey
    )

    return await this.program.methods
      .claimWinnings()
      .accounts({
        roulette: roulette,
        bet: bet,
        globalConfig: globalConfigPDA,
        claimer: this.program.provider.publicKey,
        claimerTokenAccount: claimerTokenAccount,
        rouletteTokenAccount: rouletteTokenPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc()
  }

  // Fetch roulette account data
  async fetchRouletteAccount(roulette: PublicKey): Promise<RouletteAccount | null> {
    try {
      // @ts-expect-error
      const account = await this.program.account["rouletteAccount"].fetch(roulette) as any
      return account
    } catch (error) {
      console.error('Error fetching roulette account:', error)
      return null
    }
  }

  // Fetch bet account data
  async fetchBetAccount(bet: PublicKey): Promise<BetAccount | null> {
    try {
      // @ts-expect-error
      const account = await this.program.account["betAccount"].fetch(bet) as any
      return account
    } catch (error) {
      console.error('Error fetching bet account:', error)
      return null
    }
  }

  // Get all roulette accounts
  async getAllRouletteAccounts(): Promise<RouletteAccount[]> {
    try {
      // @ts-expect-error
      const accounts = await this.program.account["rouletteAccount"].all() as any[]
      return accounts.map(account => account.account)
    } catch (error) {
      console.error('Error fetching all roulette accounts:', error)
      return []
    }
  }

  // Get bets for a specific roulette
  async getBetsForRoulette(roulette: PublicKey): Promise<BetAccount[]> {
    try {
      // @ts-expect-error
      const accounts = await this.program.account["betAccount"].all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: roulette.toBase58(),
          }
        }
      ]) as any[]
      return accounts.map(account => account.account)
    } catch (error) {
      console.error('Error fetching bets for roulette:', error)
      return []
    }
  }

  // Get user's bets
  async getUserBets(user: PublicKey): Promise<BetAccount[]> {
    try {
      // @ts-expect-error
      const accounts = await this.program.account["betAccount"].all([
        {
          memcmp: {
            offset: 8 + 32 + 8, // Skip discriminator + roulette + betId
            bytes: user.toBase58(),
          }
        }
      ]) as any[]
      return accounts.map(account => account.account)
    } catch (error) {
      console.error('Error fetching user bets:', error)
      return []
    }
  }

  // Helper methods
  private convertBetTypeToProgram(betType: BetType): any {
    const typeMap: Record<string, any> = {
      'Straight': { straight: {} },
      'Split': { split: {} },
      'Street': { street: {} },
      'Corner': { corner: {} },
      'SixLine': { sixLine: {} },
      'Red': { red: {} },
      'Black': { black: {} },
      'Even': { even: {} },
      'Odd': { odd: {} },
      'Low': { low: {} },
      'High': { high: {} },
      'FirstTwelve': { firstTwelve: {} },
      'SecondTwelve': { secondTwelve: {} },
      'ThirdTwelve': { thirdTwelve: {} },
      'FirstColumn': { firstColumn: {} },
      'SecondColumn': { secondColumn: {} },
      'ThirdColumn': { thirdColumn: {} },
    }
    const key = Object.keys(betType)[0];
    return typeMap[key];
  }

  // Utility functions for bet validation and payout calculation
  static getBetNumbers(betType: BetType, customNumbers?: number[]): number[] {
    if (customNumbers && customNumbers.length > 0) {
      return customNumbers
    }
    const key = Object.keys(betType)[0];

    switch (key) {
      case 'Red':
        return [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
      case 'Black':
        return [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
      case 'Even':
        return Array.from({length: 18}, (_, i) => (i + 1) * 2)
      case 'Odd':
        return Array.from({length: 18}, (_, i) => (i * 2) + 1)
      case 'Low':
        return Array.from({length: 18}, (_, i) => i + 1)
      case 'High':
        return Array.from({length: 18}, (_, i) => i + 19)
      case 'FirstTwelve':
        return Array.from({length: 12}, (_, i) => i + 1)
      case 'SecondTwelve':
        return Array.from({length: 12}, (_, i) => i + 13)
      case 'ThirdTwelve':
        return Array.from({length: 12}, (_, i) => i + 25)
      case 'FirstColumn':
        return [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
      case 'SecondColumn':
        return [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]
      case 'ThirdColumn':
        return [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
      default:
        return []
    }
  }

  static getPayoutMultiplier(betType: BetType): number {
    const key = Object.keys(betType)[0];
    const payouts: Record<string, number> = {
      'Straight': 35,
      'Split': 17,
      'Street': 11,
      'Corner': 8,
      'SixLine': 5,
      'Red': 1,
      'Black': 1,
      'Even': 1,
      'Odd': 1,
      'Low': 1,
      'High': 1,
      'FirstTwelve': 2,
      'SecondTwelve': 2,
      'ThirdTwelve': 2,
      'FirstColumn': 2,
      'SecondColumn': 2,
      'ThirdColumn': 2,
    }
    return payouts[key]
  }
}