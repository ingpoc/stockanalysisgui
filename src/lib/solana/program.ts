import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram, TransactionSignature, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError
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
import {
  LOTTERY_PROGRAM_ID,
  GLOBAL_CONFIG_SEED,
  LOTTERY_SEED,
  LOTTERY_TOKEN_SEED,
  TREASURY_WALLET
} from '@/lib/constants'

// Oracle account for randomness (Pyth price feed for SOL/USD)
const ORACLE_ACCOUNT = new PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');

import { DecentralizedLottery as ProgramIDL } from '@/types/lottery_types'
const IDL = require('./decentralized_lottery.json') as ProgramIDL & Idl

// Use constants for program ID and seeds
const PROGRAM_ID = new PublicKey(LOTTERY_PROGRAM_ID)

type ProgramType = Program<ProgramIDL>

// Define the subscription type
interface LotterySubscription {
  id: number;
  lotteryAddress: string;
  callback: (lotteryInfo: LotteryInfo) => void;
}

export class LotteryProgram {
  private program: ProgramType
  private connection: Connection
  private wallet: AnchorWallet
  private subscriptions: LotterySubscription[] = []

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

  async initialize(usdcMint: PublicKey, treasury?: PublicKey) {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    try {
      console.log('Initializing program with the following details:');
      console.log('- Program ID:', this.program.programId.toString());
      console.log('- USDC Mint:', usdcMint.toString());
      console.log('- Wallet:', this.program.provider.publicKey.toString());
      
      // Use the provided treasury or default to the admin wallet
      const treasuryAddress = treasury || new PublicKey(TREASURY_WALLET);
      console.log('- Treasury:', treasuryAddress.toString());

      // Get global config PDA
      const [globalConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_CONFIG_SEED)],
        this.program.programId
      );
      console.log('- Global Config PDA:', globalConfig.toString());

      return await this.program.methods
        .initialize()
        .accounts({
          globalConfig: globalConfig,
          admin: this.program.provider.publicKey,
          usdcMint: usdcMint,
          treasury: treasuryAddress, // Add treasury account
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc()
    } catch (error: any) {
      console.error('Program initialization error details:', error);
      // Check if it's a program error with a specific code
      if (error.code && error.code >= 6000) {
        throw new Error(`Program error: ${LotteryProgram.formatError(error)}`);
      }
      // Check if it's an account already initialized error
      if (error.message && error.message.includes('already in use')) {
        throw new Error('Global config account already initialized. The program may already be initialized.');
      }
      // Re-throw the original error
      throw error;
    }
  }

  async createLottery(
    type: LotteryType,
    ticketPrice: number,
    drawTime: number,
    targetPrizePool: number = 0 // Default to 0 if not specified
  ) {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    console.log('Creating lottery with the following parameters:');
    console.log('- Type:', type);
    console.log('- Ticket Price:', ticketPrice, 'USDC (as number)');
    console.log('- Draw Time:', new Date(drawTime * 1000).toISOString());
    console.log('- Target Prize Pool:', targetPrizePool, 'USDC (as number)');
    console.log('- Creator:', this.program.provider.publicKey.toString());

    // Validate inputs before sending to the program
    if (isNaN(ticketPrice) || ticketPrice <= 0) {
      throw new Error('Invalid ticket price: must be a positive number');
    }
    
    if (isNaN(targetPrizePool) || targetPrizePool < 0) {
      throw new Error('Invalid target prize pool: must be a non-negative number');
    }
    
    // Add maximum limit check based on program constraints
    if (targetPrizePool > 1000) {
      throw new Error('Target prize pool exceeds maximum limit (1000 USDC)');
    }
    
    // Convert to lamports/smallest unit if needed
    // Note: USDC has 6 decimals, so multiply by 1,000,000 to get the smallest unit
    const ticketPriceInSmallestUnit = Math.floor(ticketPrice * 1_000_000);
    const targetPrizePoolInSmallestUnit = Math.floor(targetPrizePool * 1_000_000);
    
    console.log('- Ticket Price in smallest unit:', ticketPriceInSmallestUnit);
    console.log('- Target Prize Pool in smallest unit:', targetPrizePoolInSmallestUnit);

    // Get global config PDA
    const [globalConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_CONFIG_SEED)],
      this.program.programId
    )
    console.log('- Global Config PDA:', globalConfig.toString());

    try {
      // Get global config account data to get USDC mint
      const globalConfigAccount = await this.program.account.globalConfig.fetch(
        globalConfig
      ) as unknown as GlobalConfig
      console.log('- USDC Mint from Global Config:', globalConfigAccount.usdcMint.toString());
      console.log('- Treasury from Global Config:', globalConfigAccount.treasury.toString());
    } catch (error) {
      console.error('Error fetching global config account:', error);
      throw new Error('Failed to fetch global config. Make sure the program is initialized first.');
    }

    // Get global config account data to get USDC mint
    const globalConfigAccount = await this.program.account.globalConfig.fetch(
      globalConfig
    ) as unknown as GlobalConfig

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

    // Get creator's token account
    const creatorTokenAccount = await getAssociatedTokenAddress(
      globalConfigAccount.usdcMint,
      this.program.provider.publicKey
    )

    // Check if the token account exists and create it if it doesn't
    try {
      const tokenAccount = await getAccount(this.program.provider.connection, creatorTokenAccount);
      console.log('Creator token account exists:', creatorTokenAccount.toString());
      console.log('Creator token balance:', tokenAccount.amount.toString());
      
      // No need to check if the creator has enough tokens for the prize pool
      // The prize pool will build from ticket sales
    } catch (error) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        console.log('Creating creator token account...');
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            this.program.provider.publicKey, // payer
            creatorTokenAccount, // associated token account
            this.program.provider.publicKey, // owner
            globalConfigAccount.usdcMint // mint
          )
        );
        
        const { blockhash } = await this.program.provider.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = this.program.provider.publicKey;
        
        // Sign and send the transaction
        const signedTx = await this.wallet.signTransaction(transaction);
        const txid = await this.program.provider.connection.sendRawTransaction(
          signedTx.serialize()
        );
        await this.program.provider.connection.confirmTransaction(txid);
        console.log('Created creator token account:', creatorTokenAccount.toString());
      } else {
        console.error('Error checking token account:', error);
        throw error;
      }
    }

    // Get lottery's token account PDA
    const [lotteryTokenAccount] = this.findLotteryTokenAccountPDA(lotteryAccount)

    try {
      console.log('Sending createLottery transaction with the following parameters:');
      console.log('- Lottery Type Value:', JSON.stringify(lotteryTypeValue));
      console.log('- Ticket Price BN:', new BN(ticketPriceInSmallestUnit).toString());
      console.log('- Draw Time BN:', new BN(drawTime).toString());
      console.log('- Target Prize Pool BN:', new BN(targetPrizePoolInSmallestUnit).toString());
      
      return await this.program.methods
        .createLottery(
          lotteryTypeValue,
          new BN(ticketPriceInSmallestUnit),
          new BN(drawTime),
          new BN(targetPrizePoolInSmallestUnit)
        )
        .accounts({
          lotteryAccount: lotteryAccount,
          creator: this.program.provider.publicKey,
          globalConfig: globalConfig,
          tokenMint: globalConfigAccount.usdcMint,
          creatorTokenAccount: creatorTokenAccount,
          lotteryTokenAccount: lotteryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        } as any)
        .rpc()
    } catch (error: any) {
      console.error('Error creating lottery:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Format and throw a user-friendly error
      if (error.code === 6002) {
        throw new Error('Invalid target prize pool. Please try again with a smaller target prize pool.');
      } else if (error.code === 6001) {
        throw new Error('Invalid ticket price. The program requires a valid ticket price.');
      } else if (error.message && error.message.includes('already in use')) {
        throw new Error('A lottery of this type already exists for this time period.');
      } else if (error.message && error.message.includes('InvalidPrizePool')) {
        throw new Error('Invalid target prize pool. Please try again with a smaller target prize pool.');
      }
      
      // Re-throw the original error if it's not one we specifically handle
      throw error;
    }
  }

  async buyTicket(lotteryAddress: string, numberOfTickets: number) {
    if (!this.program.provider.publicKey) {
      throw new Error("Wallet not connected")
    }

    try {
      const lotteryAccountKey = new PublicKey(lotteryAddress)
      
      // Fetch the lottery account with better error handling
      let lotteryAccount;
      try {
        lotteryAccount = await this.program.account.lotteryAccount.fetch(
          lotteryAccountKey
        ) as unknown as LotteryAccount
      } catch (error) {
        console.error('Failed to fetch lottery account:', error);
        throw new Error('Lottery not found or has been removed. Please refresh the page and try again.');
      }

      // Fetch the global config
      let globalConfig;
      try {
        globalConfig = await this.program.account.globalConfig.fetch(
          lotteryAccount.globalConfig
        ) as unknown as GlobalConfig
      } catch (error) {
        console.error('Failed to fetch global config:', error);
        throw new Error('Program configuration not found. Please initialize the program first.');
      }

      // Get user's USDC token account
      const userTokenAccount = await getAssociatedTokenAddress(
        globalConfig.usdcMint,
        this.program.provider.publicKey
      )

      // Get lottery's token account PDA
      const [lotteryTokenAccount] = this.findLotteryTokenAccountPDA(lotteryAccountKey)
      console.log('Lottery token account:', lotteryTokenAccount.toString())

      // Check if user's token account exists, if not create it
      let userTokenAccountExists = false;
      try {
        await getAccount(this.connection, userTokenAccount)
        userTokenAccountExists = true;
      } catch (error) {
        if (!(error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError)) {
          console.error('Unexpected error checking token account:', error);
          throw error;
        }
        // We'll create the account below
      }

      let txid: string;
      
      // Add a unique blockhash to prevent duplicate transactions
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
      
      try {
        if (!userTokenAccountExists) {
          const createAtaIx = createAssociatedTokenAccountInstruction(
            this.program.provider.publicKey,
            userTokenAccount,
            this.program.provider.publicKey,
            globalConfig.usdcMint
          )
          
          try {
            const tx = await this.program.methods
              .buyTicket(new BN(numberOfTickets))
              .accounts({
                lotteryAccount: lotteryAccountKey,
                userTokenAccount: userTokenAccount,
                lotteryTokenAccount: lotteryTokenAccount,
                buyer: this.program.provider.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
              } as any)
              .preInstructions([createAtaIx])
              .transaction();
              
            // Set the recent blockhash and fee payer
            tx.recentBlockhash = blockhash;
            tx.feePayer = this.program.provider.publicKey;
            
            // Sign and send the transaction
            const signedTx = await this.wallet.signTransaction(tx);
            txid = await this.connection.sendRawTransaction(signedTx.serialize());
          } catch (error: any) {
            console.error('Failed to buy ticket with new token account:', error);
            
            // Handle duplicate transaction error
            if (error.message && (
                error.message.includes('already been processed') || 
                error.message.includes('blockhash not found')
            )) {
              throw new Error('This transaction was already processed. Please wait a moment before trying again.');
            }
            
            throw error;
          }
        } else {
          try {
            const tx = await this.program.methods
              .buyTicket(new BN(numberOfTickets))
              .accounts({
                lotteryAccount: lotteryAccountKey,
                userTokenAccount: userTokenAccount,
                lotteryTokenAccount: lotteryTokenAccount,
                buyer: this.program.provider.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
              } as any)
              .transaction();
              
            // Set the recent blockhash and fee payer
            tx.recentBlockhash = blockhash;
            tx.feePayer = this.program.provider.publicKey;
            
            // Sign and send the transaction
            const signedTx = await this.wallet.signTransaction(tx);
            txid = await this.connection.sendRawTransaction(signedTx.serialize());
          } catch (error: any) {
            console.error('Failed to buy ticket:', error);
            
            // Handle duplicate transaction error
            if (error.message && (
                error.message.includes('already been processed') || 
                error.message.includes('blockhash not found')
            )) {
              throw new Error('This transaction was already processed. Please wait a moment before trying again.');
            }
            
            throw error;
          }
        }
        
        // Wait for transaction confirmation with timeout
        try {
          console.log('Waiting for transaction confirmation:', txid);
          const confirmation = await this.connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature: txid
          }, 'confirmed');
          
          if (confirmation.value.err) {
            console.error('Transaction confirmed but has errors:', confirmation.value.err);
            throw new Error('Transaction failed. Please try again.');
          }
          
          console.log('Transaction confirmed:', txid);
          
          // Add a longer delay to allow the account to be updated
          console.log('Waiting for account updates to propagate...');
          await new Promise(resolve => setTimeout(resolve, 5000)); // Increased to 5 seconds
          
          // Manually fetch the updated lottery account to ensure we have the latest data
          try {
            console.log('Fetching updated lottery account data...');
            
            // Instead of trying to decode raw account data, use a more reliable approach
            // by directly fetching the account through the program's fetch method
            let updatedLotteryAccount = null;
            let fetchAttempts = 0;
            const maxFetchAttempts = 5;
            
            while (!updatedLotteryAccount && fetchAttempts < maxFetchAttempts) {
              try {
                console.log(`Direct fetch attempt ${fetchAttempts + 1}/${maxFetchAttempts}...`);
                
                // Use the program's fetch method which is more reliable than raw decoding
                updatedLotteryAccount = await this.program.account.lotteryAccount.fetch(
                  lotteryAccountKey
                ).catch(e => {
                  console.error(`Fetch attempt ${fetchAttempts + 1} failed:`, e);
                  return null;
                });
                
                if (updatedLotteryAccount) {
                  console.log('Successfully fetched lottery account data directly!');
                } else {
                  console.log(`Account not available yet (attempt ${fetchAttempts + 1}/${maxFetchAttempts}), waiting...`);
                  // Exponential backoff with jitter
                  const baseDelay = 1000; // 1 second
                  const maxDelay = 5000; // 5 seconds
                  const delay = Math.min(baseDelay * Math.pow(1.5, fetchAttempts) + Math.random() * 500, maxDelay);
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
              } catch (fetchErr) {
                console.error(`Error in fetch attempt ${fetchAttempts + 1}:`, fetchErr);
                // Exponential backoff with jitter
                const baseDelay = 1000; // 1 second
                const maxDelay = 5000; // 5 seconds
                const delay = Math.min(baseDelay * Math.pow(1.5, fetchAttempts) + Math.random() * 500, maxDelay);
                await new Promise(resolve => setTimeout(resolve, delay));
              }
              fetchAttempts++;
            }
            
            if (!updatedLotteryAccount) {
              console.error('Failed to fetch updated lottery account after multiple attempts');
              
              // As a last resort, try to get the lottery from getLotteries()
              console.log('Attempting to get lottery from getLotteries() as a last resort...');
              const lotteries = await this.getLotteries();
              const updatedLottery = lotteries.find(l => l.address === lotteryAddress);
              
              if (updatedLottery) {
                console.log('Successfully found lottery in getLotteries() result');
              } else {
                console.warn('Could not find lottery in getLotteries() result either');
              }
            } else {
              console.log('Successfully processed updated lottery account');
              
              // Process the account data to get updated lottery info
              const updatedLotteryInfo: LotteryInfo = {
                address: lotteryAddress,
                lotteryType: this.getLotteryTypeFromAccount(updatedLotteryAccount.lotteryType),
                ticketPrice: Number(updatedLotteryAccount.ticketPrice),
                drawTime: Number(updatedLotteryAccount.drawTime),
                prizePool: Number(updatedLotteryAccount.prizePool),
                totalTickets: Number(updatedLotteryAccount.totalTickets),
                state: this.getLotteryStateFromAccount(updatedLotteryAccount.state),
                createdBy: updatedLotteryAccount.createdBy.toString(),
                globalConfig: updatedLotteryAccount.globalConfig.toString(),
                winningNumbers: updatedLotteryAccount.winningNumbers ? 
                  Buffer.from(updatedLotteryAccount.winningNumbers).toString('hex') : null
              };
              
              if ('targetPrizePool' in updatedLotteryAccount) {
                updatedLotteryInfo.targetPrizePool = Number(updatedLotteryAccount.targetPrizePool);
              }
              
              // Manually trigger any subscription callbacks with the updated data
              this.subscriptions.forEach(async (sub) => {
                try {
                  // This is a hack to manually trigger the subscription callback
                  this.connection.getAccountInfo(lotteryAccountKey);
                } catch (e) {
                  console.error('Error triggering subscription update:', e);
                }
              });
            }
          } catch (fetchError) {
            console.error('Error in account update process:', fetchError);
          }
          
          // Fetch all lotteries to ensure we have the latest state
          const lotteries = await this.getLotteries();
          const updatedLottery = lotteries.find(l => l.address === lotteryAddress);
          
          if (updatedLottery) {
            console.log('Updated lottery data after purchase:', updatedLottery);
            
            // Manually trigger subscription updates to ensure UI gets updated
            await this.triggerManualUpdate(lotteryAddress);
          } else {
            console.warn('Could not find updated lottery in getLotteries() result');
          }
        } catch (error: any) {
          console.error('Error confirming transaction:', error);
          
          // Check if it's a timeout error
          if (error.message && error.message.includes('timed out')) {
            console.log('Transaction may still be processing. Check your wallet for confirmation.');
          }
          
          // We still return the txid even if confirmation fails
        }
      } catch (error: any) {
        // Handle SendTransactionError specifically
        if (error.name === 'SendTransactionError') {
          console.error('SendTransactionError details:', error.logs);
          
          if (error.message && error.message.includes('already been processed')) {
            throw new Error('This transaction was already processed. Please wait a moment before trying again.');
          }
        }
        
        throw error;
      }
      
      return txid;
    } catch (error) {
      console.error('Error in buyTicket:', error);
      throw error;
    }
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

          const lotteryInfo: LotteryInfo = {
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
          
          // Add targetPrizePool if it exists in the account data
          if ('targetPrizePool' in accountData) {
            lotteryInfo.targetPrizePool = toBigIntSafe(accountData.targetPrizePool)
          }
          
          return lotteryInfo
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
    console.log('Setting up subscription for lottery:', lotteryAddress);
    
    const lotteryAccountKey = new PublicKey(lotteryAddress);
    
    const subscription = this.connection.onAccountChange(
      lotteryAccountKey,
      async (accountInfo) => {
        try {
          console.log('Lottery account change detected for:', lotteryAddress);
          
          // Add an initial delay before any processing to allow blockchain state to settle
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Instead of trying to decode raw account data, use a more reliable approach
          // by directly fetching the account through the program's fetch method
          let lotteryAccount = null;
          let fetchAttempts = 0;
          const maxFetchAttempts = 5;
          
          while (!lotteryAccount && fetchAttempts < maxFetchAttempts) {
            try {
              console.log(`Direct fetch attempt ${fetchAttempts + 1}/${maxFetchAttempts}...`);
              
              // Use the program's fetch method which is more reliable than raw decoding
              lotteryAccount = await this.program.account.lotteryAccount.fetch(
                lotteryAccountKey
              ).catch(e => {
                console.error(`Fetch attempt ${fetchAttempts + 1} failed:`, e);
                return null;
              });
              
              if (lotteryAccount) {
                console.log('Successfully fetched lottery account data directly!');
                break;
              } else {
                console.log(`Account not available yet (attempt ${fetchAttempts + 1}/${maxFetchAttempts}), waiting...`);
                // Exponential backoff with jitter
                const baseDelay = 1000; // 1 second
                const maxDelay = 5000; // 5 seconds
                const delay = Math.min(baseDelay * Math.pow(1.5, fetchAttempts) + Math.random() * 500, maxDelay);
                await new Promise(resolve => setTimeout(resolve, delay));
              }
            } catch (fetchErr) {
              console.error(`Error in fetch attempt ${fetchAttempts + 1}:`, fetchErr);
              // Exponential backoff with jitter
              const baseDelay = 1000; // 1 second
              const maxDelay = 5000; // 5 seconds
              const delay = Math.min(baseDelay * Math.pow(1.5, fetchAttempts) + Math.random() * 500, maxDelay);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            fetchAttempts++;
          }
          
          // If we couldn't fetch the account directly, try to get it from getLotteries()
          if (!lotteryAccount) {
            console.error('Failed to fetch lottery account after multiple attempts');
            console.log('Attempting to get lottery from getLotteries() as a fallback...');
            
            try {
              const lotteries = await this.getLotteries();
              const updatedLottery = lotteries.find(l => l.address === lotteryAddress);
              
              if (updatedLottery) {
                console.log('Successfully found lottery in getLotteries() result');
                callback(updatedLottery);
                return;
              } else {
                console.warn('Could not find lottery in getLotteries() result either');
                return;
              }
            } catch (fallbackError) {
              console.error('Error in fallback lottery data fetch:', fallbackError);
              return;
            }
          }
          
          // Process the account data to get updated lottery info
          const lotteryInfo: LotteryInfo = {
            address: lotteryAddress,
            lotteryType: this.getLotteryTypeFromAccount(lotteryAccount.lotteryType),
            ticketPrice: Number(lotteryAccount.ticketPrice),
            drawTime: Number(lotteryAccount.drawTime),
            prizePool: Number(lotteryAccount.prizePool),
            totalTickets: Number(lotteryAccount.totalTickets),
            state: this.getLotteryStateFromAccount(lotteryAccount.state),
            createdBy: lotteryAccount.createdBy.toString(),
            globalConfig: lotteryAccount.globalConfig.toString(),
            winningNumbers: lotteryAccount.winningNumbers ? 
              Buffer.from(lotteryAccount.winningNumbers).toString('hex') : null
          };
          
          if ('targetPrizePool' in lotteryAccount) {
            lotteryInfo.targetPrizePool = Number(lotteryAccount.targetPrizePool);
          }
          
          console.log('Successfully processed lottery account update:', lotteryAddress);
          callback(lotteryInfo);
        } catch (error) {
          console.error('Error processing lottery account update:', lotteryAddress, error);
          // We don't call the callback with an error to avoid breaking the UI
          // The error is logged for debugging purposes
        }
      },
      'confirmed'
    );
    
    this.subscriptions.push({ id: subscription, lotteryAddress, callback });
    return subscription;
  }

  unsubscribe(subscription: number) {
    this.connection.removeAccountChangeListener(subscription)
    this.subscriptions = this.subscriptions.filter(sub => sub.id !== subscription)
  }

  unsubscribeAll() {
    this.subscriptions.forEach(sub => this.connection.removeAccountChangeListener(sub.id))
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
      if (state.cancelled) return LotteryState.Cancelled

      // Try to parse the Anchor format
      const stateValue = state.toString()
      if (stateValue.includes('created')) return LotteryState.Created
      if (stateValue.includes('open')) return LotteryState.Open
      if (stateValue.includes('drawing')) return LotteryState.Drawing
      if (stateValue.includes('completed')) return LotteryState.Completed
      if (stateValue.includes('expired')) return LotteryState.Expired
      if (stateValue.includes('cancelled')) return LotteryState.Cancelled

      throw new Error(`Invalid lottery state format: ${JSON.stringify(state)}`)
    } catch (error) {
      console.error('Error parsing lottery state:', error)
      throw new Error(`Failed to parse lottery state: ${JSON.stringify(state)}`)
    }
  }

  private findLotteryTokenAccountPDA(lotteryPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(LOTTERY_TOKEN_SEED), lotteryPubkey.toBuffer()],
      this.program.programId
    )
  }

  private findGlobalConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_CONFIG_SEED)],
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

      // Create accounts object with required accounts
      const accounts: any = {
        lotteryAccount: lotteryPubkey,
        globalConfig,
        lotteryTokenAccount,
        admin: this.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      };

      // Add oracle account when transitioning to Drawing state or Cancelled state
      if (nextState === LotteryState.Drawing || nextState === LotteryState.Cancelled) {
        console.log(`Adding oracle account for ${nextState} state transition:`, ORACLE_ACCOUNT.toString());
        accounts.oracleAccount = ORACLE_ACCOUNT;
      }

      return await this.program.methods
        .transitionState(this.getProgramLotteryState(nextState))
        .accounts(accounts)
        .rpc();
    } catch (error) {
      console.error('Error transitioning state:', error);
      throw error;
    }
  }

  async isProgramInitialized(): Promise<boolean> {
    try {
      const [globalConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_CONFIG_SEED)],
        this.program.programId
      );
      
      console.log('Checking if program is initialized...');
      console.log('- Global Config PDA:', globalConfig.toString());
      
      const accountInfo = await this.connection.getAccountInfo(globalConfig);
      
      if (!accountInfo) {
        console.log('Global config account does not exist. Program is not initialized.');
        return false;
      }
      
      try {
        const globalConfigData = await this.program.account.globalConfig.fetch(
          globalConfig
        ) as unknown as GlobalConfig;
        
        console.log('Program is initialized with:');
        console.log('- Admin:', globalConfigData.admin.toString());
        console.log('- USDC Mint:', globalConfigData.usdcMint.toString());
        console.log('- Treasury:', globalConfigData.treasury.toString());
        
        return true;
      } catch (error) {
        console.error('Error decoding global config account:', error);
        return false;
      }
    } catch (error) {
      console.error('Error checking if program is initialized:', error);
      return false;
    }
  }

  async doesLotteryExist(type: LotteryType, drawTime: number): Promise<boolean> {
    try {
      // Create the lottery type string for PDA seed
      let lotteryTypeString: string;
      
      switch (type) {
        case LotteryType.Daily:
          lotteryTypeString = 'daily';
          break;
        case LotteryType.Weekly:
          lotteryTypeString = 'weekly';
          break;
        case LotteryType.Monthly:
          lotteryTypeString = 'monthly';
          break;
        default:
          throw new Error('Invalid lottery type');
      }

      // Get lottery account PDA
      const [lotteryAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(LOTTERY_SEED),
          Buffer.from(lotteryTypeString),
          new BN(drawTime).toArrayLike(Buffer, 'le', 8)
        ],
        this.program.programId
      );
      
      console.log('Checking if lottery exists at address:', lotteryAccount.toString());
      
      // Check if the account exists
      const accountInfo = await this.connection.getAccountInfo(lotteryAccount);
      
      if (!accountInfo) {
        console.log('Lottery account does not exist.');
        return false;
      }
      
      console.log('Lottery account exists!');
      return true;
    } catch (error) {
      console.error('Error checking if lottery exists:', error);
      return false;
    }
  }

  // Add a new method to manually trigger subscription updates
  async triggerManualUpdate(lotteryAddress: string): Promise<void> {
    console.log('Manually triggering update for lottery:', lotteryAddress);
    
    try {
      const lotteryAccountKey = new PublicKey(lotteryAddress);
      
      // Directly fetch the lottery account
      const lotteryAccount = await this.program.account.lotteryAccount.fetch(
        lotteryAccountKey
      ).catch(e => {
        console.error('Failed to fetch lottery account for manual update:', e);
        return null;
      });
      
      if (!lotteryAccount) {
        console.error('Could not fetch lottery account for manual update');
        return;
      }
      
      // Process the account data to get updated lottery info
      const lotteryInfo: LotteryInfo = {
        address: lotteryAddress,
        lotteryType: this.getLotteryTypeFromAccount(lotteryAccount.lotteryType),
        ticketPrice: Number(lotteryAccount.ticketPrice),
        drawTime: Number(lotteryAccount.drawTime),
        prizePool: Number(lotteryAccount.prizePool),
        totalTickets: Number(lotteryAccount.totalTickets),
        state: this.getLotteryStateFromAccount(lotteryAccount.state),
        createdBy: lotteryAccount.createdBy.toString(),
        globalConfig: lotteryAccount.globalConfig.toString(),
        winningNumbers: lotteryAccount.winningNumbers ? 
          Buffer.from(lotteryAccount.winningNumbers).toString('hex') : null
      };
      
      if ('targetPrizePool' in lotteryAccount) {
        lotteryInfo.targetPrizePool = Number(lotteryAccount.targetPrizePool);
      }
      
      // Find and trigger all subscriptions for this lottery
      const matchingSubscriptions = this.subscriptions.filter(
        sub => sub.lotteryAddress === lotteryAddress
      );
      
      if (matchingSubscriptions.length > 0) {
        console.log(`Found ${matchingSubscriptions.length} subscriptions to update`);
        
        matchingSubscriptions.forEach(sub => {
          try {
            sub.callback(lotteryInfo);
            console.log('Successfully triggered manual subscription update');
          } catch (callbackError) {
            console.error('Error in subscription callback during manual update:', callbackError);
          }
        });
      } else {
        console.log('No matching subscriptions found for manual update');
      }
    } catch (error) {
      console.error('Error in manual subscription update:', error);
    }
  }
} 