import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from '@solana/spl-token';
import { DecentralizedRoulette as ProgramIDL } from '@/types/decentralized_roulette';
import {
  RouletteType,
  BetType,
  RouletteState,
  RouletteAccount,
  BetAccount,
} from '@/types/generated/enhanced-types';
import {
  ROULETTE_PROGRAM_ID as PROGRAM_ID,
  USDC_MINT,
  ROULETTE_GLOBAL_CONFIG_SEED,
  ROULETTE_SEED,
  ROULETTE_BET_SEED,
  ROULETTE_TOKEN_SEED,
} from '@/lib/constants';

// Import the IDL
const IDL = require('./decentralized_roulette.json') as ProgramIDL & Idl;

// Types are imported from generated types

type ProgramType = Program<ProgramIDL>;

// Program configuration
export const ROULETTE_PROGRAM_ID = new PublicKey(PROGRAM_ID);

// USDC mint addresses
export const USDC_MINT_ADDRESS = new PublicKey(USDC_MINT);
export const USDC_MINT_DEVNET = new PublicKey(USDC_MINT);

// Constants for game timing (in seconds)
export const BETTING_DURATION = 180; // 3 minutes
export const LOCK_DURATION = 30; // 30 seconds
export const SPIN_DURATION = 30; // 30 seconds
export const REVEAL_DELAY = 60; // 1 minute

// PDA seeds
export const GLOBAL_CONFIG_SEED = ROULETTE_GLOBAL_CONFIG_SEED;
export const ROULETTE_SEED_STRING = ROULETTE_SEED;
export const BET_SEED = ROULETTE_BET_SEED;
export const ROULETTE_TOKEN_SEED_STRING = ROULETTE_TOKEN_SEED;

export class RouletteProgram {
  private _program: ProgramType | null = null;
  private connection: Connection;
  private wallet: AnchorWallet;
  public readonly programId = ROULETTE_PROGRAM_ID;

  constructor(connection: Connection, wallet: AnchorWallet) {
    this.connection = connection;
    this.wallet = wallet;
  }

  private async initializeProgram(): Promise<ProgramType> {
    if (this._program) {
      return this._program;
    }

    try {
      const provider = new AnchorProvider(
        this.connection,
        this.wallet,
        AnchorProvider.defaultOptions()
      );

      // Create program using IDL (which contains the program ID)
      this._program = new Program(IDL, provider) as ProgramType;

      return this._program;
    } catch (error) {
      throw error;
    }
  }

  private get program(): Promise<ProgramType> {
    return this.initializeProgram();
  }

  // Get the global config PDA
  getGlobalConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_CONFIG_SEED)],
      this.programId
    );
  }

  // Check if the program is initialized
  async isInitialized(): Promise<boolean> {
    try {
      const [globalConfigPDA] = this.getGlobalConfigPDA();
      const program = await this.program;
      const globalConfig = await (program.account as any).globalConfig.fetch(
        globalConfigPDA
      );
      return true;
    } catch (error: any) {
      // This is expected for uninitialized programs - the globalConfig account won't exist
      if (
        error?.message?.includes('Account does not exist') ||
        error?.message?.includes('Account not found') ||
        error?.toString().includes('Invalid account discriminator')
      ) {
        return false;
      }
      return false;
    }
  }

  // Get roulette account PDA
  getRoulettePDA(creator: PublicKey, nonce: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(ROULETTE_SEED_STRING),
        creator.toBuffer(),
        new BN(nonce).toArrayLike(Buffer, 'le', 8),
      ],
      this.programId
    );
  }

  // Get bet account PDA
  getBetPDA(
    roulette: PublicKey,
    bettor: PublicKey,
    betId: number
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(BET_SEED),
        roulette.toBuffer(),
        bettor.toBuffer(),
        new BN(betId).toArrayLike(Buffer, 'le', 8),
      ],
      this.programId
    );
  }

  // Get roulette token account PDA
  getRouletteTokenPDA(roulette: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(ROULETTE_TOKEN_SEED_STRING), roulette.toBuffer()],
      this.programId
    );
  }

  // Initialize the roulette program (admin only)
  async initialize(): Promise<TransactionSignature> {
    const program = await this.program;
    if (!program.provider.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA();
    const usdcMint =
      process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet'
        ? USDC_MINT_ADDRESS
        : USDC_MINT_DEVNET; // Use devnet USDC for testing

    // Get treasury token account - should be owned by the authority (admin wallet)
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      program.provider.publicKey // Use authority wallet as owner, not globalConfigPDA
    );

    // Get first roulette PDA (nonce = 1 for first game)
    const [firstRoulettePDA] = this.getRoulettePDA(
      program.provider.publicKey,
      1
    );

    // Get first roulette token account PDA
    const [firstRouletteTokenPDA] = this.getRouletteTokenPDA(firstRoulettePDA);

    return await program.methods
      .initialize()
      .accounts({
        globalConfig: globalConfigPDA,
        firstRoulette: firstRoulettePDA,
        authority: program.provider.publicKey,
        usdcMint: usdcMint,
        treasuryTokenAccount: treasuryTokenAccount,
        firstRouletteTokenAccount: firstRouletteTokenPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();
  }

  // Create a new roulette game
  async createRoulette(
    rouletteType: RouletteType,
    minBet: number,
    maxBet: number,
    gameDuration: number,
    nonce: number
  ): Promise<TransactionSignature> {
    const program = await this.program;
    if (!program.provider.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA();
    const [roulettePDA] = this.getRoulettePDA(
      program.provider.publicKey,
      nonce
    );
    const [rouletteTokenPDA] = this.getRouletteTokenPDA(roulettePDA);

    const usdcMint =
      process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet'
        ? USDC_MINT_ADDRESS
        : USDC_MINT_DEVNET;
    const creatorTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      program.provider.publicKey
    );

    // Convert enum to the format expected by the program
    const programRouletteType =
      rouletteType === RouletteType.European
        ? { european: {} }
        : { american: {} };

    return await program.methods
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
        creator: program.provider.publicKey,
        usdcMint: usdcMint,
        creatorTokenAccount: creatorTokenAccount,
        rouletteTokenAccount: rouletteTokenPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();
  }

  // Automatic bet placement with seamless game management
  async placeBet(
    roulette: PublicKey,
    betType: BetType,
    betAmount: number,
    betNumbers: number[]
  ): Promise<TransactionSignature> {
    try {
      // First, ensure we have an active game (create if needed)
      const activeRouletteKey = await this.ensureActiveGame(roulette);

      // Execute the bet with retry logic
      try {
        return await this.executeBet(
          activeRouletteKey,
          betType,
          betAmount,
          betNumbers
        );
      } catch (error: any) {
        // If the error is related to the bet account, try again after a delay
        if (
          error.message?.includes('AccountNotInitialized') ||
          error.message?.includes('account not found')
        ) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.executeBet(
            activeRouletteKey,
            betType,
            betAmount,
            betNumbers
          );
        }

        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  // Ensure there's an active game, create new one if current is expired/completed
  private async ensureActiveGame(
    requestedRoulette: PublicKey
  ): Promise<PublicKey> {
    try {
      const program = await this.program;
      if (!program.provider.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Check if the requested roulette is still active
      let rouletteAccount: any;
      try {
        rouletteAccount = (await (program.account as any).rouletteAccount.fetch(
          requestedRoulette
        )) as any;
      } catch (error) {
        return this.createNewGameAutomatically();
      }

      // Check if game is still active
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = rouletteAccount.endTime?.toNumber() || 0;
      const state = this.getStateString(rouletteAccount.state);

      const isActive =
        ['open', 'locked'].includes(state.toLowerCase()) &&
        endTime > currentTime;

      if (isActive) {
        return requestedRoulette;
      } else {
        return this.createNewGameAutomatically();
      }
    } catch (error) {
      return this.createNewGameAutomatically();
    }
  }

  // Automatically create new game with timestamp-based nonce
  private async createNewGameAutomatically(): Promise<PublicKey> {
    const program = await this.program;
    if (!program.provider.publicKey) {
      throw new Error('Wallet not connected');
    }

    const nonce = Date.now(); // Use timestamp for unique nonce

    await this.createNextGame(nonce);

    // Return the PDA for the newly created game
    const [newRoulettePDA] = this.getRoulettePDA(
      program.provider.publicKey,
      nonce
    );

    return newRoulettePDA;
  }

  // Helper to get state string from state object
  private getStateString(state: any): string {
    try {
      if (!state) return 'unknown';

      // Handle case where state is already a string
      if (typeof state === 'string') return state;

      // Handle case where state is an object with a 'state' property
      if (state.state) {
        return this.getStateString(state.state);
      }

      // Handle case where state is an object with state as a key
      const stateKeys = Object.keys(state).filter(k =>
        ['open', 'locked', 'spinning', 'settled', 'completed'].includes(
          k.toLowerCase()
        )
      );

      if (stateKeys.length > 0) {
        return stateKeys[0];
      }

      // Handle case where state is an object with a single key
      const keys = Object.keys(state);
      if (keys.length === 1) {
        return keys[0];
      }

      // Fallback to string representation
      return JSON.stringify(state);
    } catch (error) {
      return 'error';
    }
  }

  // Execute the actual bet placement
  private async executeBet(
    roulette: PublicKey,
    betType: BetType,
    betAmount: number,
    betNumbers: number[]
  ): Promise<TransactionSignature> {
    try {
      const program = await this.program;
      if (!program.provider.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Get current roulette state to determine bet ID
      let rouletteAccount: any;
      try {
        rouletteAccount = (await (program.account as any).rouletteAccount.fetch(
          roulette
        )) as any;

        // Log full account data for debugging
      } catch (error) {
        throw new Error(
          `Roulette account not found at ${roulette.toString()}. Please ensure the game exists and is active.`
        );
      }

      // Check if game is still accepting bets
      const currentTime = Math.floor(Date.now() / 1000);
      const currentState = this.getStateString(rouletteAccount.state);

      if (currentState !== 'open') {
        throw new Error(
          `Game is not accepting bets. Current state: ${currentState}`
        );
      }

      if (rouletteAccount.endTime?.toNumber() < currentTime) {
        throw new Error('Betting period has ended for this game');
      }

      const betId = rouletteAccount.totalBets.toNumber();

      const [globalConfigPDA] = this.getGlobalConfigPDA();
      const [betPDA] = this.getBetPDA(
        roulette,
        program.provider.publicKey,
        betId
      );
      const [rouletteTokenPDA] = this.getRouletteTokenPDA(roulette);

      const usdcMint =
        process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet'
          ? USDC_MINT_ADDRESS
          : USDC_MINT_DEVNET;
      const bettorTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        program.provider.publicKey
      );

      // Convert enum to the format expected by the program
      const programBetType = this.convertBetTypeToProgram(betType);

      // Convert numbers to proper byte buffer
      const betNumbersBuffer = Buffer.from(betNumbers.map(n => n & 0xff));

      // Execute the bet placement
      try {
        const tx = await (program.methods as any)
          .placeBet(programBetType, new BN(betAmount), betNumbersBuffer)
          .accounts({
            roulette,
            bet: betPDA,
            globalConfig: globalConfigPDA,
            bettor: program.provider.publicKey,
            usdcMint,
            bettorTokenAccount,
            rouletteTokenAccount: rouletteTokenPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          } as any)

          .rpc({
            skipPreflight: false,
            commitment: 'confirmed',
          });

        return tx;
      } catch (txError: unknown) {
        const error = txError as Error & { logs?: string[] };

        // Try to extract more detailed error information

        // Re-throw with more context
        throw new Error(
          `Failed to place bet: ${error.message || 'Unknown error'}`
        );
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the caller
    }
  }

  // Lock betting for a roulette game
  async lockBetting(roulette: PublicKey): Promise<TransactionSignature> {
    const program = await this.program;
    if (!program.provider.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA();

    return await program.methods
      .lockBetting()
      .accounts({
        roulette: roulette,
        globalConfig: globalConfigPDA,
        caller: program.provider.publicKey,
      } as any)
      .rpc();
  }

  // Process game lifecycle automatically
  async processGameLifecycle(
    roulette: PublicKey
  ): Promise<TransactionSignature> {
    const program = await this.program;
    if (!program.provider.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA();

    return await program.methods
      .processGameLifecycle()
      .accounts({
        roulette: roulette,
        globalConfig: globalConfigPDA,
        caller: program.provider.publicKey,
      } as any)
      .rpc();
  }

  // Spin roulette (trigger the spin phase)
  async spinRoulette(roulette: PublicKey): Promise<TransactionSignature> {
    const program = await this.program;
    if (!program.provider.publicKey) {
      throw new Error('Wallet not connected');
    }

    // For the roulette program, spinning is handled through processGameLifecycle
    // which automatically transitions the game through its phases
    return await this.processGameLifecycle(roulette);
  }

  // Create next game automatically using program defaults
  async createNextGame(nonce: number): Promise<TransactionSignature> {
    const program = await this.program;
    if (!program.provider.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA();
    const [newRoulettePDA] = this.getRoulettePDA(
      program.provider.publicKey,
      nonce
    );
    const [rouletteTokenPDA] = this.getRouletteTokenPDA(newRoulettePDA);

    const usdcMint =
      process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet'
        ? USDC_MINT_ADDRESS
        : USDC_MINT_DEVNET;

    return await program.methods
      .createNextGame(new BN(nonce))
      .accounts({
        newRoulette: newRoulettePDA,
        globalConfig: globalConfigPDA,
        caller: program.provider.publicKey,
        usdcMint: usdcMint,
        rouletteTokenAccount: rouletteTokenPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();
  }

  // Process automation cycle
  async processAutomation(): Promise<TransactionSignature> {
    const program = await this.program;
    if (!program.provider.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA();

    return await program.methods
      .processAutomation()
      .accounts({
        globalConfig: globalConfigPDA,
        caller: program.provider.publicKey,
      } as any)
      .rpc();
  }

  // Expire all current games (admin cleanup function)
  async expireAllCurrentGames(): Promise<{
    totalGames: number;
    processedGames: number;
    errors: string[];
  }> {
    try {
      // Get all roulette games
      const allGames = await this.getAllRouletteAccounts();

      if (allGames.length === 0) {
        return {
          totalGames: 0,
          processedGames: 0,
          errors: [],
        };
      }

      // Process automation once to trigger state transitions for all games
      let processedCount = 0;
      const errors: string[] = [];

      try {
        // Call processAutomation which will handle state transitions for all games
        await this.processAutomation();
        processedCount = allGames.length;
      } catch (error) {
        const errorMsg = `Failed to process automation: ${error}`;
        errors.push(errorMsg);
      }

      return {
        totalGames: allGames.length,
        processedGames: processedCount,
        errors,
      };
    } catch (error) {
      throw error;
    }
  }

  // Claim winnings from a bet
  async claimWinnings(
    roulette: PublicKey,
    bet: PublicKey
  ): Promise<TransactionSignature> {
    const program = await this.program;
    if (!program.provider.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [globalConfigPDA] = this.getGlobalConfigPDA();
    const [rouletteTokenPDA] = this.getRouletteTokenPDA(roulette);

    const usdcMint =
      process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet'
        ? USDC_MINT_ADDRESS
        : USDC_MINT_DEVNET;
    const claimerTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      program.provider.publicKey
    );

    return await program.methods
      .claimWinnings()
      .accounts({
        roulette: roulette,
        bet: bet,
        globalConfig: globalConfigPDA,
        claimer: program.provider.publicKey,
        claimerTokenAccount: claimerTokenAccount,
        rouletteTokenAccount: rouletteTokenPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();
  }

  // Fetch roulette account data
  async fetchRouletteAccount(
    roulette: PublicKey
  ): Promise<RouletteAccount | null> {
    try {
      const program = await this.program;
      const account = (await (program.account as any).rouletteAccount.fetch(
        roulette
      )) as any;
      return account;
    } catch (error) {
      return null;
    }
  }

  // Fetch bet account data
  async fetchBetAccount(bet: PublicKey): Promise<BetAccount | null> {
    try {
      const program = await this.program;
      const account = (await (program.account as any).betAccount.fetch(
        bet
      )) as any;
      return account;
    } catch (error) {
      return null;
    }
  }

  // Get all roulette accounts with their public keys
  async getAllRouletteAccounts(): Promise<
    Array<{ publicKey: PublicKey; account: RouletteAccount }>
  > {
    try {
      const program = await this.program;
      
      // Skip initialization check to reduce RPC calls - assume it's initialized if we got here
      // Use camelCase as per project guidelines
      const accounts = (await (
        program.account as any
      ).rouletteAccount.all()) as any[];

      // Return both public key and account data
      return accounts.map(account => ({
        publicKey: account.publicKey,
        account: account.account,
      }));
    } catch (error) {
      // If we get an error, it might be due to uninitialized program
      // Return empty array instead of failing
      console.log('🎰 [RPC] getAllRouletteAccounts failed (likely uninitialized):', error);
      return [];
    }
  }

  // Get bets for a specific roulette
  async getBetsForRoulette(roulette: PublicKey): Promise<BetAccount[]> {
    try {
      const program = await this.program;
      const accounts = (await (program.account as any).betAccount.all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: roulette.toBase58(),
          },
        },
      ])) as any[];
      return accounts.map(account => account.account);
    } catch (error) {
      return [];
    }
  }

  // Get user's bets
  async getUserBets(user: PublicKey): Promise<BetAccount[]> {
    try {
      const program = await this.program;
      const accounts = (await (program.account as any).betAccount.all([
        {
          memcmp: {
            offset: 8 + 32 + 8, // Skip discriminator + roulette + betId
            bytes: user.toBase58(),
          },
        },
      ])) as any[];
      return accounts.map(account => account.account);
    } catch (error) {
      return [];
    }
  }

  // Helper methods
  private convertBetTypeToProgram(betType: BetType): any {
    // Handle case where betType is already in the correct format
    if (typeof betType === 'object' && betType !== null) {
      return betType;
    }

    // Convert string enum to program format
    const typeMap: Record<string, any> = {
      straight: { straight: {} },
      split: { split: {} },
      street: { street: {} },
      corner: { corner: {} },
      sixline: { sixLine: {} },
      red: { red: {} },
      black: { black: {} },
      even: { even: {} },
      odd: { odd: {} },
      low: { low: {} },
      high: { high: {} },
      dozen1: { firstTwelve: {} },
      dozen2: { secondTwelve: {} },
      dozen3: { thirdTwelve: {} },
      column1: { firstColumn: {} },
      column2: { secondColumn: {} },
      column3: { thirdColumn: {} },
      dozen: { firstTwelve: {} }, // Default to first dozen if just 'dozen' is passed
      column: { firstColumn: {} }, // Default to first column if just 'column' is passed
    };

    // Convert to lowercase for case-insensitive matching
    const key = String(betType).toLowerCase();
    const result = typeMap[key];

    if (!result) {
      return { straight: {} };
    }

    return result;
  }

  // Utility functions for bet validation and payout calculation
  static getBetNumbers(betType: BetType, customNumbers?: number[]): number[] {
    if (customNumbers && customNumbers.length > 0) {
      return customNumbers;
    }
    const key = Object.keys(betType)[0];

    switch (key) {
      case 'Red':
        return [
          1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
        ];
      case 'Black':
        return [
          2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
        ];
      case 'Even':
        return Array.from({ length: 18 }, (_, i) => (i + 1) * 2);
      case 'Odd':
        return Array.from({ length: 18 }, (_, i) => i * 2 + 1);
      case 'Low':
        return Array.from({ length: 18 }, (_, i) => i + 1);
      case 'High':
        return Array.from({ length: 18 }, (_, i) => i + 19);
      case 'FirstTwelve':
        return Array.from({ length: 12 }, (_, i) => i + 1);
      case 'SecondTwelve':
        return Array.from({ length: 12 }, (_, i) => i + 13);
      case 'ThirdTwelve':
        return Array.from({ length: 12 }, (_, i) => i + 25);
      case 'FirstColumn':
        return [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
      case 'SecondColumn':
        return [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
      case 'ThirdColumn':
        return [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
      default:
        return [];
    }
  }

  static getPayoutMultiplier(betType: BetType): number {
    const key = Object.keys(betType)[0];
    const payouts: Record<string, number> = {
      Straight: 35,
      Split: 17,
      Street: 11,
      Corner: 8,
      SixLine: 5,
      Red: 1,
      Black: 1,
      Even: 1,
      Odd: 1,
      Low: 1,
      High: 1,
      FirstTwelve: 2,
      SecondTwelve: 2,
      ThirdTwelve: 2,
      FirstColumn: 2,
      SecondColumn: 2,
      ThirdColumn: 2,
    };
    return payouts[key];
  }
}
