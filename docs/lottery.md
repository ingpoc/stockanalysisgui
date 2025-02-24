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
   │   └── use-lottery-subscriptions.ts  // Subscription management
   └── lib/solana/
       └── program.ts           // Lottery program interactions
   ```

2. **File Responsibilities**
   - `lottery.ts`: Core types, interfaces, and enums for frontend use
   - `lottery_types.ts`: IDL-generated TypeScript types for program interaction
   - `lottery-card.tsx`: Display and interaction with individual lotteries
   - `create-lottery-dialog.tsx`: UI for creating new lotteries
   - `admin-lottery-controls.tsx`: UI for managing lottery states
   - `initialize-program-dialog.tsx`: Program initialization interface
   - `use-lottery-subscriptions.ts`: Real-time lottery data updates
   - `program.ts`: Solana program interaction methods

## Program Constants

1. **Critical Addresses**
   ```typescript
   // Program ID
   const PROGRAM_ID = new PublicKey('7MTSfGTiXNH4ZGztQPdvzpkKivUEUzQhJvsccJFDEMyt')
   
   // PDA Seeds
   const GLOBAL_CONFIG_SEED = 'global_config'
   const LOTTERY_SEED = 'lottery'
   const LOTTERY_TOKEN_SEED = 'lottery_token'
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
       [Buffer.from('lottery_token'), lotteryPubkey.toBuffer()],
       this.program.programId
     )
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

## UI Data Transformation

1. **Lottery Info Interface**
   ```typescript
   interface LotteryInfo {
     address: string           // Lottery account address as string
     lotteryType: LotteryType // Enum value for UI
     ticketPrice: number      // Converted from bigint
     drawTime: Date          // Converted from bigint timestamp
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
       drawTime: new Date(Number(account.drawTime) * 1000),
       prizePool: Number(account.prizePool),
       totalTickets: Number(account.totalTickets),
       winningNumbers: account.winningNumbers ? 
         Buffer.from(account.winningNumbers).toString('hex') : null,
       state: getLotteryState(account.state),
       createdBy: account.createdBy.toString(),
       globalConfig: account.globalConfig.toString()
     }
   }

   // Helper functions for type conversion
   function getLotteryType(value: LotteryTypeValue): LotteryType {
     if ('daily' in value) return LotteryType.Daily
     if ('weekly' in value) return LotteryType.Weekly
     return LotteryType.Monthly
   }

   function getLotteryState(value: LotteryStateValue): LotteryState {
     if ('created' in value) return LotteryState.Created
     if ('open' in value) return LotteryState.Open
     if ('drawing' in value) return LotteryState.Drawing
     if ('completed' in value) return LotteryState.Completed
     return LotteryState.Expired
   }
   ```

## Common Pitfalls

1. **Type Errors to Watch**
   - Using snake_case instead of camelCase for field names
   - Forgetting to convert PublicKey to string for display
   - Not handling Option types as nullable (T | null)
   - Incorrect Buffer handling for winning numbers
   - Missing bigint to number conversions for numeric displays

2. **Account Field Requirements**
   ```typescript
   interface LotteryAccount {
     // Required field types
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