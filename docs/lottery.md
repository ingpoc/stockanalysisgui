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