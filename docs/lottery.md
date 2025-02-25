# Decentralized Lottery System Documentation

## System Overview

The decentralized lottery system is a Solana-based application that allows users to participate in various types of lotteries (daily, weekly, monthly) using USDC tokens. The system consists of a Solana program (smart contract) and a Next.js frontend interface.

### Key Features
- Multiple lottery types (daily, weekly, monthly)
- USDC token integration for ticket purchases
- Treasury account for fee collection
- Admin controls for lottery management
- Real-time updates via account subscriptions
- Secure wallet integration

### Architecture
The system follows a client-server architecture where:
- Solana blockchain serves as the backend database and execution environment
- Next.js application provides the user interface
- Anchor framework facilitates the interaction between frontend and Solana program

## File Structure

1. **Core Files**
   ```
   src/
   ├── types/
   │   ├── lottery.ts           // Type definitions and interfaces
   │   └── lottery_types.ts     // IDL-generated TypeScript types
   ├── components/lottery/
   │   ├── lottery-card.tsx     // Individual lottery display
   │   ├── create-lottery-dialog.tsx  // Lottery creation UI
   │   ├── admin-lottery-controls.tsx // Admin state management UI
   │   └── initialize-program-dialog.tsx  // Program initialization
   ├── hooks/
   │   ├── use-lottery-program.ts     // Program instance management
   │   └── use-lottery-subscriptions.ts  // Subscription management
   ├── lib/
   │   ├── constants.ts         // System-wide constants
   │   └── solana/
   │       ├── program.ts       // Lottery program interactions
   │       ├── decentralized_lottery.json  // Program IDL
   │       └── lottery-program-context.tsx // Program context provider
   └── app/
       └── (protected)/
           └── lottery/
               └── page.tsx     // Main lottery page
   ```

2. **File Responsibilities**
   - `lottery.ts`: Core types, interfaces, and enums for frontend use
   - `lottery_types.ts`: IDL-generated TypeScript types for program interaction
   - `lottery-card.tsx`: Display and interaction with individual lotteries
   - `create-lottery-dialog.tsx`: UI for creating new lotteries
   - `admin-lottery-controls.tsx`: UI for managing lottery states
   - `initialize-program-dialog.tsx`: Program initialization interface
   - `use-lottery-program.ts`: Hook for accessing the lottery program instance
   - `use-lottery-subscriptions.ts`: Real-time lottery data updates
   - `constants.ts`: System-wide constants including addresses and seeds
   - `program.ts`: Solana program interaction methods
   - `decentralized_lottery.json`: Program IDL defining instructions and accounts
   - `lottery-program-context.tsx`: React context for program instance sharing
   - `page.tsx`: Main lottery page with UI components

## Program Constants and Configuration

1. **Critical Addresses and Environment Variables**
   ```typescript
   // Environment variables in .env.local
   NEXT_PUBLIC_ADMIN_WALLET="7Q3UBDfjZgNJNCQBdJrji33f2FvtJ1z3DErcAV6hFsf4"
   NEXT_PUBLIC_TREASURY_WALLET="7Q3UBDfjZgNJNCQBdJrji33f2FvtJ1z3DErcAV6hFsf4"
   NEXT_PUBLIC_LOTTERY_PROGRAM_ID="F1pffGp4n5qyNRcCnpoTH5CEfVKQEGxAxmRuRScUw4tz"
   NEXT_PUBLIC_USDC_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
   NEXT_PUBLIC_GLOBAL_CONFIG_SEED="global_config"
   NEXT_PUBLIC_LOTTERY_SEED="lottery"
   NEXT_PUBLIC_LOTTERY_TOKEN_SEED="lottery_token"
   
   // Constants in src/lib/constants.ts
   export const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '7Q3UBDfjZgNJNCQBdJrji33f2FvtJ1z3DErcAV6hFsf4'
   export const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || ADMIN_WALLET
   export const LOTTERY_PROGRAM_ID = process.env.NEXT_PUBLIC_LOTTERY_PROGRAM_ID || 'F1pffGp4n5qyNRcCnpoTH5CEfVKQEGxAxmRuRScUw4tz'
   export const USDC_MINT = process.env.NEXT_PUBLIC_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
   export const GLOBAL_CONFIG_SEED = process.env.NEXT_PUBLIC_GLOBAL_CONFIG_SEED || 'global_config'
   export const LOTTERY_SEED = process.env.NEXT_PUBLIC_LOTTERY_SEED || 'lottery'
   export const LOTTERY_TOKEN_SEED = process.env.NEXT_PUBLIC_LOTTERY_TOKEN_SEED || 'lottery_token'
   ```

2. **Program ID and PDA Seeds**
   - `LOTTERY_PROGRAM_ID`: The Solana program ID for the lottery system
   - `GLOBAL_CONFIG_SEED`: Seed for deriving the global configuration PDA
   - `LOTTERY_SEED`: Seed for deriving lottery account PDAs
   - `LOTTERY_TOKEN_SEED`: Seed for deriving lottery token account PDAs

3. **Important Accounts**
   - `ADMIN_WALLET`: Admin wallet with special privileges for program management
   - `TREASURY_WALLET`: Treasury wallet for collecting fees and funds
   - `USDC_MINT`: USDC token mint address used for ticket purchases

## Program Initialization

1. **Initialization Process**
   The lottery program must be initialized before any lotteries can be created. This is done through the `initialize-program-dialog.tsx` component, which calls the `initialize` method in `program.ts`.

   ```typescript
   // From initialize-program-dialog.tsx
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     if (!connected) {
       toast.error("Wallet not connected", {
         description: "Please connect your wallet to initialize the program."
       })
       return
     }

     try {
       setIsLoading(true)
       console.log('Initializing program with mint address:', usdcMint)
       console.log('Using treasury address:', treasury)
       
       const mintPubkey = new PublicKey(usdcMint)
       const treasuryPubkey = new PublicKey(treasury)
       
       await program.initialize(mintPubkey, treasuryPubkey)
       toast.success("Program initialized", {
         description: "The lottery program has been initialized successfully."
       })
       setOpen(false)
     } catch (error) {
       console.error('Program initialization failed:', error)
       const errorMessage = handleProgramError(error)
       toast.error("Initialization failed", {
         description: errorMessage
       })
     } finally {
       setIsLoading(false)
     }
   }
   ```

2. **Treasury Account Handling**
   The treasury account is a critical component of the lottery system. It receives fees and funds from lottery operations.

   ```typescript
   // From program.ts
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
       // Error handling...
     }
   }
   ```

## Type Definitions

1. **Lottery Types**
   ```typescript
   // Enum for UI representation
   enum LotteryType {
     Daily = 'daily',
     Weekly = 'weekly',
     Monthly = 'monthly'
   }

   // Type for on-chain data
   type LotteryTypeValue = 
     | { daily: Record<string, never> }
     | { weekly: Record<string, never> }
     | { monthly: Record<string, never> }
   ```

2. **Lottery States**
   ```typescript
   // Enum for UI representation
   enum LotteryState {
     Created = 'created',
     Open = 'open',
     Drawing = 'drawing',
     Completed = 'completed',
     Expired = 'expired',
     Cancelled = 'cancelled'  // Added for state transitions
   }

   // Type for on-chain data
   type LotteryStateValue = 
     | { created: Record<string, never> }
     | { open: Record<string, never> }
     | { drawing: Record<string, never> }
     | { completed: Record<string, never> }
     | { expired: Record<string, never> }
     | { cancelled: Record<string, never> }
   ```

3. **Global Configuration**
   ```typescript
   interface GlobalConfig {
     treasury: PublicKey        // Treasury wallet address
     treasuryFeePercentage: number  // Fee percentage for treasury
     admin: PublicKey          // Admin wallet address
     usdcMint: PublicKey       // USDC token mint address
   }
   ```

4. **Lottery Account**
   ```typescript
   interface LotteryAccount {
     lotteryType: LotteryTypeValue;     // enum
     ticketPrice: bigint;               // u64
     drawTime: bigint;                  // i64
     prizePool: bigint;                 // u64
     totalTickets: bigint;              // u64
     winningNumbers: Buffer | null;      // Option<Vec<u8>>
     state: LotteryStateValue;          // enum
     createdBy: PublicKey;              // Pubkey
     globalConfig: PublicKey;           // Pubkey
   }
   ```

5. **Lottery Info (Frontend Representation)**
   ```typescript
   interface LotteryInfo {
     address: string           // Lottery account address as string
     lotteryType: LotteryType // Enum value for UI
     ticketPrice: number      // Converted from bigint
     drawTime: number         // Timestamp in seconds
     prizePool: number       // Converted from bigint
     totalTickets: number    // Converted from bigint
     winningNumbers: string | null  // Hex string from Buffer
     state: LotteryState    // Enum value for UI
     createdBy: string      // PublicKey as string
     globalConfig: string   // PublicKey as string
   }
   ```

## Type Consistency Rules

1. **Field Naming Convention**
   ```typescript
   // IMPORTANT: There are two naming conventions to be aware of:
   
   // 1. TypeScript/Frontend (camelCase)
   interface LotteryInfo {
     lotteryType: LotteryType
     ticketPrice: number
     // ... other fields
   }
   
   // 2. Anchor Program (snake_case)
   // When interacting with program methods:
   program.methods.transitionState().accounts({
     lottery_account: lotteryPubkey,
     global_config: globalConfig,
     lottery_token_account: lotteryTokenAccount,
     // ... other accounts
   })
   ```

2. **Account Naming Rules**
   ```typescript
   // ❌ INCORRECT: Using camelCase with program methods
   .accounts({
     lotteryAccount: lotteryPubkey,
     globalConfig,
     lotteryTokenAccount,
   })
   
   // ✅ CORRECT: Using snake_case with program methods
   .accounts({
     lottery_account: lotteryPubkey,
     global_config: globalConfig,
     lottery_token_account: lotteryTokenAccount,
   } as any) // Type assertion needed due to TypeScript/Anchor mismatch
   ```

3. **State Transition Handling**
   ```typescript
   // ❌ INCORRECT: Passing UI enum directly
   program.methods.transitionState(nextState)
   
   // ✅ CORRECT: Converting UI enum to program state
   const programState = {
     [LotteryState.Created]: { created: {} },
     [LotteryState.Open]: { open: {} },
     // ... other states
   }[state]
   program.methods.transitionState(programState)
   ```

## Account Handling

1. **Account Deserialization**
   ```typescript
   // ✅ Correct account decoding with proper error handling
   try {
     const decodedAccount = this.program.coder.accounts.decode(
       'LotteryAccount',
       accountInfo.data
     ) as unknown as LotteryAccount

     // Convert to UI format
     return {
       ticketPrice: Number(decodedAccount.ticketPrice),
       state: this.getLotteryStateFromAccount(decodedAccount.state),
       // ... other fields
     }
   } catch (error) {
     console.error('Error decoding account:', error)
     throw error
   }
   ```

2. **PublicKey Handling**
   ```typescript
   // In Components:
   // ✅ CORRECT: Convert string to PublicKey before passing to program
   const lotteryPubkey = new PublicKey(lottery.address)
   await program.transitionState(lotteryPubkey, selectedState)
   
   // In Program Class:
   // ✅ CORRECT: Accept PublicKey in method signatures
   async transitionState(
     lotteryPubkey: PublicKey,
     nextState: LotteryState
   ): Promise<TransactionSignature>
   ```

## Lottery Operations

1. **Creating a Lottery**
   ```typescript
   async createLottery(
     type: LotteryType,
     ticketPrice: number,
     drawTime: number,
     prizePool: number
   ) {
     // Implementation details...
     
     // Create the lottery type enum value and corresponding string for PDA seed
     let lotteryTypeValue: LotteryTypeValue;
     let lotteryTypeString: string;
     
     switch (type) {
       case LotteryType.Daily:
         lotteryTypeValue = { daily: {} };
         lotteryTypeString = 'daily';
         break;
       // Other cases...
     }

     // Get lottery account PDA
     const [lotteryAccount] = PublicKey.findProgramAddressSync(
       [
         Buffer.from(LOTTERY_SEED),
         Buffer.from(lotteryTypeString),
         new BN(drawTime).toArrayLike(Buffer, 'le', 8)
       ],
       this.program.programId
     )

     // Program method call
     return await this.program.methods
       .createLottery(
         lotteryTypeValue,
         new BN(ticketPrice),
         new BN(drawTime),
         new BN(prizePool)
       )
       .accounts({
         // Account details...
       } as any)
       .rpc()
   }
   ```

2. **Buying Tickets**
   ```typescript
   async buyTicket(lotteryAddress: string, numberOfTickets: number) {
     // Implementation details...
     
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
   ```

3. **Transitioning Lottery State**
   ```typescript
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
         } as any)
         .rpc();
     } catch (error) {
       console.error('Error transitioning state:', error);
       throw error;
     }
   }
   ```

## Common Pitfalls and Solutions

1. **Account Naming Mismatches**
   ```typescript
   // Problem: TypeScript types use camelCase but program expects snake_case
   // Solution: Use type assertion and snake_case in program calls
   .accounts({
     lottery_account: pubkey,
     // ... other accounts
   } as any)
   ```

2. **State Transition Errors**
   ```typescript
   // Problem: Direct enum usage with program
   // Solution: Convert UI state to program state format
   private getProgramLotteryState(state: LotteryState): any {
     const stateMap = {
       [LotteryState.Created]: { created: {} },
       // ... other states
     }
     return stateMap[state]
   }
   ```

3. **PDA Derivation**
   ```typescript
   // Problem: Inconsistent PDA seeds
   // Solution: Use constants and consistent buffer creation
   private findLotteryTokenAccountPDA(lotteryPubkey: PublicKey): [PublicKey, number] {
     return PublicKey.findProgramAddressSync(
       [Buffer.from(LOTTERY_TOKEN_SEED), lotteryPubkey.toBuffer()],
       this.program.programId
     )
   }
   ```

4. **Treasury Account Missing**
   ```typescript
   // Problem: Treasury account not provided during initialization
   // Solution: Default to TREASURY_WALLET constant if not provided
   const treasuryAddress = treasury || new PublicKey(TREASURY_WALLET);
   ```

5. **Initialization Errors**
   ```typescript
   // Problem: Program already initialized
   // Solution: Check for specific error message
   if (error.message && error.message.includes('already in use')) {
     throw new Error('Global config account already initialized. The program may already be initialized.');
   }
   ```

## Best Practices

1. **Program Method Calls**
   - Always use snake_case for account names in program calls
   - Use type assertions to handle TypeScript/Anchor naming mismatches
   - Convert UI enums to program format before passing to methods
   - Handle all errors with proper error messages

2. **Component Integration**
   - Convert string addresses to PublicKey before passing to program
   - Handle loading states during transactions
   - Provide clear error messages to users
   - Update UI state after successful transactions

3. **Error Handling**
   - Use try-catch blocks for all program interactions
   - Log errors for debugging
   - Show user-friendly error messages
   - Handle edge cases and invalid states

4. **State Management**
   - Validate state transitions before sending
   - Update UI immediately after successful transitions
   - Handle failed transitions gracefully
   - Maintain consistent state between UI and program

5. **Environment Variables**
   - Always use constants from `constants.ts` instead of direct environment variables
   - Provide sensible defaults for all environment variables
   - Document all environment variables in README.md
   - Use proper naming conventions for environment variables (NEXT_PUBLIC_* for client-side)

## UI Data Transformation

1. **Lottery Info Interface**
   ```typescript
   interface LotteryInfo {
     address: string           // Lottery account address as string
     lotteryType: LotteryType // Enum value for UI
     ticketPrice: number      // Converted from bigint
     drawTime: number         // Timestamp in seconds
     prizePool: number       // Converted from bigint
     totalTickets: number    // Converted from bigint
     winningNumbers: string | null  // Hex string from Buffer
     state: LotteryState    // Enum value for UI
     createdBy: string      // PublicKey as string
     globalConfig: string   // PublicKey as string
   }
   ```

2. **Data Conversion Patterns**
   ```typescript
   // ✅ Convert on-chain account to UI format
   function convertToLotteryInfo(
     address: PublicKey,
     account: LotteryAccount
   ): LotteryInfo {
     return {
       address: address.toString(),
       lotteryType: getLotteryType(account.lotteryType),
       ticketPrice: Number(account.ticketPrice),
       drawTime: Number(account.drawTime),
       prizePool: Number(account.prizePool),
       totalTickets: Number(account.totalTickets),
       winningNumbers: account.winningNumbers ? 
         Buffer.from(account.winningNumbers).toString('hex') : null,
       state: getLotteryState(account.state),
       createdBy: account.createdBy.toString(),
       globalConfig: account.globalConfig.toString()
     }
   }
   ```

## Error Prevention

1. **Always Validate**
   - Account structure matches program definition
   - Field names are in camelCase
   - Proper type conversions are applied
   - Option/nullable fields are handled
   - PublicKey fields are converted to strings for display

2. **Common Fixes**
   ```typescript
   // ❌ Problem: snake_case field access
   account.global_config
   
   // ✅ Solution: use camelCase
   account.globalConfig
   
   // ❌ Problem: raw PublicKey usage
   account.createdBy
   
   // ✅ Solution: convert to string
   account.createdBy.toString()
   ```

## Testing and Debugging

1. **Console Logging**
   ```typescript
   // Add detailed logging for initialization
   console.log('Initializing program with the following details:');
   console.log('- Program ID:', this.program.programId.toString());
   console.log('- USDC Mint:', usdcMint.toString());
   console.log('- Wallet:', this.program.provider.publicKey.toString());
   console.log('- Treasury:', treasuryAddress.toString());
   console.log('- Global Config PDA:', globalConfig.toString());
   ```

2. **Error Formatting**
   ```typescript
   // Helper method to format errors
   static formatError(error: any): string {
     if (error.code) {
       switch (error.code) {
         case 6000:
           return 'Lottery type not supported'
         case 6001:
           return 'Invalid ticket price'
         // Other error codes...
         default:
           return 'An unexpected error occurred'
       }
     }
     return error.message || 'An unexpected error occurred'
   }
   ```

3. **User Feedback**
   ```typescript
   // Provide clear feedback to users
   toast.success("Program initialized", {
     description: "The lottery program has been initialized successfully."
   })
   
   toast.error("Initialization failed", {
     description: errorMessage
   })
   ```

## References

1. **Important Addresses**
   - Program ID: `F1pffGp4n5qyNRcCnpoTH5CEfVKQEGxAxmRuRScUw4tz`
   - USDC Mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
   - Admin/Treasury Wallet: `7Q3UBDfjZgNJNCQBdJrji33f2FvtJ1z3DErcAV6hFsf4`
   - Global Config PDA: `9Gmin1DevMjy9Too8ZQq78KdWoX16wSpEtQ2xj863f6W`

2. **External Documentation**
   - [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
   - [Anchor Framework Documentation](https://www.anchor-lang.com/)
   - [SPL Token Program Documentation](https://spl.solana.com/token)

## Core Design Patterns

### 1. Account Handling and Error Prevention

The lottery system implements several patterns to handle blockchain account data reliably:

#### Retry Mechanism with Exponential Backoff
```typescript
// Example from buyTicket method
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
```

#### Fallback Mechanisms
```typescript
// If direct fetch fails, try alternative methods
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
```

#### Manual Update Triggering
```typescript
// Method to manually trigger subscription updates
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
```

### 2. Subscription Management

The system uses a subscription pattern to provide real-time updates to the UI:

```typescript
// Subscription interface
interface LotterySubscription {
  id: number;
  lotteryAddress: string;
  callback: (lotteryInfo: LotteryInfo) => void;
}

// Subscription methods
subscribeToLotteryChanges(
  lotteryAddress: string,
  callback: (lotteryInfo: LotteryInfo) => void
): number {
  // Implementation details...
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
```

### 3. Transaction Handling

The system implements robust transaction handling with confirmation and error management:

```typescript
// Transaction sending with confirmation
const signedTx = await this.wallet.signTransaction(tx);
txid = await this.connection.sendRawTransaction(signedTx.serialize());

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
} catch (error) {
  // Error handling...
}
```

## Important Considerations

### 1. Blockchain State Propagation

When working with blockchain applications, account data updates are not immediately available after a transaction is confirmed. The system implements several strategies to handle this:

- **Delayed Fetching**: Wait for a sufficient period (5 seconds) after transaction confirmation before attempting to fetch updated data.
- **Retry Mechanisms**: Implement multiple fetch attempts with increasing delays.
- **Fallback Methods**: Use alternative data sources if primary fetch methods fail.
- **Manual Update Triggering**: Provide a mechanism to manually trigger UI updates when automatic updates fail.

### 2. Error Handling for Common Blockchain Issues

The system handles common blockchain-related errors:

```typescript
// Handle duplicate transaction error
if (error.message && (
    error.message.includes('already been processed') || 
    error.message.includes('blockhash not found')
)) {
  throw new Error('This transaction was already processed. Please wait a moment before trying again.');
}

// Handle "Account not found" errors with retry logic
if (error.message && error.message.includes('Account not found: LotteryAccount')) {
  console.log('Account not found error detected, implementing special handling...');
  // Retry logic implementation...
}
```

### 3. Type Safety and Data Transformation

The system maintains type safety between on-chain and UI representations:

```typescript
// Convert on-chain enum to UI enum
getLotteryTypeFromAccount(lotteryType: LotteryTypeValue): LotteryType {
  if ('daily' in lotteryType) return LotteryType.Daily
  if ('weekly' in lotteryType) return LotteryType.Weekly
  if ('monthly' in lotteryType) return LotteryType.Monthly
  return LotteryType.Daily // Default fallback
}

// Convert UI enum to on-chain enum
getLotteryTypeForAccount(lotteryType: LotteryType): LotteryTypeValue {
  switch (lotteryType) {
    case LotteryType.Daily: return { daily: {} }
    case LotteryType.Weekly: return { weekly: {} }
    case LotteryType.Monthly: return { monthly: {} }
  }
}
```

## Best Practices

1. **Always implement retry mechanisms** for account data fetching to handle blockchain state propagation delays.
2. **Use exponential backoff with jitter** for retries to prevent thundering herd problems.
3. **Provide fallback mechanisms** for critical operations to ensure reliability.
4. **Implement comprehensive error handling** specific to blockchain errors.
5. **Maintain proper subscription management** to prevent memory leaks and ensure UI updates.
6. **Add sufficient delays** after transaction confirmation before attempting to fetch updated data.
7. **Use direct program fetch methods** rather than raw account data decoding when possible.
8. **Implement manual update triggers** for situations where automatic updates fail.
9. **Provide clear logging** throughout the process for debugging and monitoring.
10. **Handle specific error messages** with targeted recovery strategies.
```

## State Transition Requirements Table

| State Transition | Required Accounts | Special Requirements |
|------------------|-------------------|----------------------|
| Created → Open   | admin, lotteryAccount, globalConfig, lotteryTokenAccount | Admin authorization |
| Open → Drawing   | admin, lotteryAccount, globalConfig, lotteryTokenAccount, oracleAccount | Admin authorization, Oracle account required |
| Open → Cancelled | admin, lotteryAccount, globalConfig, lotteryTokenAccount, oracleAccount | Admin authorization, Oracle account required |
| Drawing → Completed | admin, lotteryAccount, globalConfig, lotteryTokenAccount | Admin authorization |
| Drawing → Expired | admin, lotteryAccount, globalConfig, lotteryTokenAccount | Admin authorization |
| Drawing → Cancelled | admin, lotteryAccount, globalConfig, lotteryTokenAccount, oracleAccount | Admin authorization, Oracle account required |

## Oracle Account Handling

The oracle account is a critical component for certain state transitions in the lottery system. It is used to generate random numbers for the lottery drawing process and to securely cancel lotteries.

### When Oracle Account is Required

The oracle account is required for the following state transitions:
- **Open → Drawing**: When transitioning from Open to Drawing state, the oracle account is used to generate random numbers for the lottery.
- **Open → Cancelled**: When cancelling a lottery from the Open state, the oracle account is required for secure cancellation.
- **Drawing → Cancelled**: When cancelling a lottery from the Drawing state, the oracle account is required.

### Implementation Example

```typescript
// In program.ts
async transitionState(
  lotteryPubkey: PublicKey,
  nextState: LotteryState
): Promise<TransactionSignature> {
  try {
    // ... other code ...
    
    // Add oracle account for Drawing and Cancelled state transitions
    if (nextState === LotteryState.Drawing || nextState === LotteryState.Cancelled) {
      console.log(`Adding oracle account for ${nextState} state transition:`, ORACLE_ACCOUNT.toString());
      accounts.oracleAccount = ORACLE_ACCOUNT;
    }
    
    // ... rest of the method ...
  } catch (error) {
    console.error('Error transitioning state:', error);
    throw error;
  }
}
```

## Common Error Messages and Solutions

| Error Message | Possible Cause | Solution |
|---------------|----------------|----------|
| "Oracle account not provided. This is required for Drawing and Cancelled state transitions." | Attempting to transition to Drawing or Cancelled state without including the oracle account | Ensure the oracle account is included in the transaction |
| "Insufficient funds in your wallet to complete this transaction." | Wallet doesn't have enough SOL to pay for transaction fees or enough USDC for the operation | Add more funds to your wallet |
| "Transaction signing failed. You may have rejected the transaction or your wallet is locked." | User rejected the transaction in their wallet or the wallet is locked | Approve the transaction in your wallet or unlock your wallet |
| "Wallet error: Unable to sign the transaction." | Generic wallet signing error | Check wallet connection and try again |
| "A lottery of this type already exists for this time period." | Attempting to create a duplicate lottery | Wait for the current lottery to complete or choose a different time period |
| "Invalid ticket price." | The ticket price is not a valid positive number | Enter a valid positive number for the ticket price |
| "Lottery is not open for ticket purchases" | Attempting to buy tickets when lottery is not in Open state | Wait for the lottery to be in the Open state |

## UI Feedback for State Transitions

When transitioning lottery states, it's important to provide clear feedback to users about what's happening. Here are examples of how to implement user feedback for different state transitions:

```typescript
// Example from admin-lottery-controls.tsx
const handleStateTransition = async () => {
  if (!wallet.connected || !selectedState) {
    toast.error('Error', {
      description: 'Please connect your wallet and select a state.'
    })
    return
  }

  setIsLoading(true)
  try {
    // Provide specific feedback based on the state transition
    if (selectedState === LotteryState.Drawing) {
      toast.info('Transitioning to Drawing state', {
        description: 'This will use the oracle account to generate random numbers for the lottery.'
      })
    } else if (selectedState === LotteryState.Cancelled) {
      toast.info('Transitioning to Cancelled state', {
        description: 'This will use the oracle account to cancel the lottery.'
      })
    }

    await program.transitionState(new PublicKey(lottery.address), selectedState)
    toast.success('State transition successful')
    onStateChange()
  } catch (error) {
    console.error('Failed to transition state:', error)
    const errorMessage = handleProgramError(error)
    toast.error('Failed to transition state', {
      description: errorMessage
    })
  } finally {
    setIsLoading(false)
  }
}
```

## Wallet Error Handling

The lottery system implements comprehensive error handling for wallet-related errors, which is crucial for providing clear feedback to users when transactions fail due to wallet issues.

### Types of Wallet Errors

1. **Transaction Signing Failures**: Occurs when a user rejects a transaction or when the wallet is locked.
2. **Insufficient Funds**: Happens when the wallet doesn't have enough SOL for transaction fees or enough USDC for the operation.
3. **Generic Wallet Errors**: Other wallet-related errors that may occur during transaction signing.

### Implementation

The system uses a dedicated error handling function that checks for specific wallet error types:

```typescript
// From utils.ts
export function handleProgramError(error: any): string {
  console.error('Program error details:', error);
  
  // Check for wallet errors
  if (error.name === 'WalletSignTransactionError') {
    if (error.message.includes('failed to sign transaction')) {
      return 'Transaction signing failed. You may have rejected the transaction or your wallet is locked.';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds in your wallet to complete this transaction.';
    }
    return 'Wallet error: Unable to sign the transaction. Please check your wallet and try again.';
  }
  
  // Other error handling...
}
```

### Usage in Components

This error handling is used throughout the application to provide clear feedback to users:

```typescript
// Example usage in a component
try {
  await program.buyTicket(lottery.address, numberOfTickets);
  toast.success('Tickets purchased successfully!');
} catch (error) {
  console.error('Failed to buy tickets:', error);
  const errorMessage = handleProgramError(error);
  toast.error(errorMessage);
}
```

### Best Practices for Wallet Error Handling

1. **Always log the full error**: Log the complete error object for debugging purposes.
2. **Provide user-friendly messages**: Convert technical error messages to user-friendly language.
3. **Handle specific wallet errors**: Check for specific wallet error types and provide targeted messages.
4. **Display errors in the UI**: Use toast notifications or other UI elements to display error messages.
5. **Guide users to resolution**: Include suggestions for how to resolve the error when possible.

By implementing comprehensive wallet error handling, the lottery system ensures that users receive clear feedback when transactions fail, improving the overall user experience and reducing support requests.