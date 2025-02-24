## File Structure

1. **Core Files**
   ```
   src/
   ├── types/
   │   └── lottery.ts           // Type definitions and interfaces
   ├── components/lottery/
   │   ├── lottery-card.tsx     // Individual lottery display
   │   ├── create-lottery-dialog.tsx  // Lottery creation UI
   │   └── initialize-program-dialog.tsx  // Program initialization
   ├── hooks/
   │   └── use-lottery-subscriptions.ts  // Subscription management
   └── lib/solana/
       └── program.ts           // Lottery program interactions
   ```

2. **File Responsibilities**
   - `lottery.ts`: Core types, interfaces, and enums
   - `lottery-card.tsx`: Display and interaction with individual lotteries
   - `create-lottery-dialog.tsx`: UI for creating new lotteries
   - `initialize-program-dialog.tsx`: Program initialization interface
   - `use-lottery-subscriptions.ts`: Real-time lottery data updates
   - `program.ts`: Solana program interaction methods

## Program Constants

1. **Critical Addresses**
            - Program ID: 7MTSfGTiXNH4ZGztQPdvzpkKivUEUzQhJvsccJFDEMyt
            - USDC Mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
            - Global Config PDA: 9Gmin1DevMjy9Too8ZQq78KdWoX16wSpEtQ2xj863f6W
            - Program Authority/Admin/Treasurer: 7Q3UBDfjZgNJNCQBdJrji33f2FvtJ1z3DErcAV6hFsf4

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
     Expired = 'expired'
   }

   // Type for on-chain data
   type LotteryStateValue = 
     | { created: Record<string, never> }
     | { open: Record<string, never> }
     | { drawing: Record<string, never> }
     | { completed: Record<string, never> }
     | { expired: Record<string, never> }
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
   // ❌ Never use snake_case in TypeScript
   const lottery_type = account.lottery_type;
   const ticket_price = account.ticket_price;
   
   // ✅ Always use camelCase in TypeScript
   const lotteryType = account.lotteryType;
   const ticketPrice = account.ticketPrice;
   ```

2. **Rust to TypeScript Type Mappings**
   ```rust
   // Rust Types        // TypeScript Types
   String              // string
   u64/i64            // bigint
   Option<T>          // T | null
   Vec<u8>            // Buffer
   Pubkey             // PublicKey (needs .toString() for display)
   ```

3. **Account Field Access**
   ```typescript
   // ❌ Incorrect - Using Rust field names
   decodedAccount.lottery_type
   decodedAccount.ticket_price
   decodedAccount.winning_numbers
   
   // ✅ Correct - Using TypeScript field names
   decodedAccount.lotteryType
   decodedAccount.ticketPrice
   decodedAccount.winningNumbers
   ```

## Account Handling

1. **Account Deserialization**
   ```typescript
   // ✅ Correct account decoding
   const decodedAccount = this.program.coder.accounts.decode(
     'lotteryAccount',  // Exact name from IDL
     accountInfo.data
   )

   // ✅ Correct field access and conversion
   const info = {
     ticketPrice: Number(decodedAccount.ticketPrice),
     createdBy: decodedAccount.createdBy.toString(),
     winningNumbers: decodedAccount.winningNumbers ? 
       Buffer.from(decodedAccount.winningNumbers).toString('hex') : null
   }
   ```

2. **PublicKey Handling**
   ```typescript
   // ❌ Incorrect - Using PublicKey directly in UI
   account.createdBy
   
   // ✅ Correct - Convert to string for UI
   account.createdBy.toString()
   ```

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