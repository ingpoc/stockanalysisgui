## Basic Commands

### Network Configuration

To check current network configuration:
```bash
solana config get
```

To switch between networks:
```bash
# Switch to devnet
solana config set --url https://api.devnet.solana.com

# Switch to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Switch to localnet
solana config set --url http://127.0.0.1:8899
```

### Wallet Management

To check your CLI wallet address:
```bash
solana address
```

To check which keypair file is being used:
```bash
solana config get | grep Keypair
> Keypair Path: /Users/gurusharan/.config/solana/id.json
```

Note: The CLI wallet address (used for program deployment) is different from your browser wallet address (like Phantom or Solflare).

### Creating a New Wallet

To create a new wallet, use the following command:

```bash
solana-keygen new
```

### Checking Account Balance

To check the balance of an account, use the following command:

```bash
solana balance <ACCOUNT_ADDRESS>

# Example with devnet
solana balance --url devnet
> 1 SOL

# Example with localnet
solana balance --url http://127.0.0.1:8899
```

### Requesting an Airdrop

To request an airdrop of SOL on the devnet or testnet, use the following commands:

```bash
# Devnet
solana airdrop 1 --url https://api.devnet.solana.com

# Testnet
solana airdrop 1 --url https://api.testnet.solana.com

# Localnet
solana airdrop 1 --url http://127.0.0.1:8899

# Airdrop to specific address
solana airdrop 1 <RECIPIENT_ADDRESS> --url https://api.devnet.solana.com

# Example successful airdrop
solana airdrop 1 8TUdLtHmFrJ8GCnrMAV4ujzCueN6BRLcbvUh6wcUKMF5 --url https://api.devnet.solana.com
> Requesting airdrop of 1 SOL
> Signature: 2y4zMpNMGDNnWgAcCN1P5jirNR5Y5erhDKHu4fbmU9Cyo5QEtg6waMvCc9viPPy82cZdiHeSFXJPASx2rE5yBMDu
> 1 SOL
```

### Handling Rate Limits

When requesting airdrops, you may encounter rate limits. Here are the solutions:

1. **Use the Solana Faucet Website (Recommended)**:
   - Visit https://faucet.solana.com
   - Enter the wallet address
   - Request SOL (up to 2 SOL per request)
   - No rate limits

2. **Try Multiple RPC Endpoints**:
   ```bash
   # Default devnet
   solana airdrop 1 <ADDRESS> --url https://api.devnet.solana.com

   # Alternative endpoints (if available)
   solana airdrop 1 <ADDRESS> --url https://devnet.solana.rpcpool.com
   ```

3. **Wait and Retry**:
   - Rate limits typically reset after 24 hours
   - Try smaller amounts (0.5 SOL instead of 1 SOL)
   - Space out requests by a few minutes

4. **Use Local Validator**:
   - For development and testing
   - No rate limits
   - Unlimited SOL available

## Advanced Commands

### Using Local Validator

To work with a local validator:

```bash
# Start local validator (automatically done by anchor)
anchor localnet

# Deploy to localnet
anchor deploy

# Check local validator status
solana validators --url http://127.0.0.1:8899

# Local validator details
Ledger location: .anchor/test-ledger
Log: .anchor/test-ledger/validator.log
RPC URL: http://127.0.0.1:8899
```

### Sending a Transaction

To send a transaction, use the following command:

```bash
solana transfer <RECIPIENT_ADDRESS> <AMOUNT>
```

### Deploying a Program

To deploy a program to the Solana blockchain, use the following commands:

```bash
# Build the program first
anchor build

# Deploy to devnet (requires ~1.8 SOL)
anchor deploy --provider.cluster devnet

# Deploy to localnet (free, unlimited SOL)
anchor deploy

# Check if a program exists on devnet
solana program show <PROGRAM_ID> --url https://api.devnet.solana.com

# Example checking program existence
solana program show 4v1we6y3fhEKd54BM8ABPJpK9HSa1srjqJcvTkuhFugb --url https://api.devnet.solana.com
```

## Common Issues and Solutions

### Rate Limits

When requesting an airdrop, you may encounter rate limits. Here are some solutions:

1. **Using Multiple Small Requests**:
```bash
for i in {1..2}; do
  solana airdrop 0.5
done
```

2. **Alternative Methods When Rate Limited**:
- Use the Solana Faucet website: https://faucet.solana.com
- Wait 24 hours for rate limit reset
- Use alternative RPC endpoints
- Transfer SOL from another devnet wallet
- Use local validator (no rate limits)

### Insufficient Funds for Deployment

Program deployment requires approximately 1.8 SOL (as of 2024). If you see this error:
```
Error: Account <ADDRESS> has insufficient funds for spend (1.72255128 SOL) + fee (0.001245 SOL)
```
Solutions:
1. Make sure to have at least 2 SOL in your wallet before attempting devnet deployment
2. Use local validator where SOL is unlimited and free


Current CLI Wallet Address: 7Q3UBDfjZgNJNCQBdJrji33f2FvtJ1z3DErcAV6hFsf4
Current CLI Wallet Balance: 1.9999851 SOL
Current Program Address: 7MTSfGTiXNH4ZGztQPdvzpkKivUEUzQhJvsccJFDEMyt