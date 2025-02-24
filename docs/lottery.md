## Program Constants

1. **Critical Addresses**
            - Program ID: 7MTSfGTiXNH4ZGztQPdvzpkKivUEUzQhJvsccJFDEMyt
            - USDC Mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
            - Global Config PDA: 9Gmin1DevMjy9Too8ZQq78KdWoX16wSpEtQ2xj863f6W
            - Program Authority/Admin/Treasurer: 7Q3UBDfjZgNJNCQBdJrji33f2FvtJ1z3DErcAV6hFsf4

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