## Basic Commands

### Creating a New Wallet

To create a new wallet, use the following command:

```bash
solana-keygen new
```

### Checking Account Balance

To check the balance of an account, use the following command:

```bash
solana balance <ACCOUNT_ADDRESS>
```

### Requesting an Airdrop

To request an airdrop of SOL on the devnet or testnet, use the following commands:

```bash
# Devnet
solana airdrop 1 --url https://api.devnet.solana.com

# Testnet
solana airdrop 1 --url https://api.testnet.solana.com
```

## Advanced Commands

### Sending a Transaction

To send a transaction, use the following command:

```bash
solana transfer <RECIPIENT_ADDRESS> <AMOUNT>
```

### Deploying a Program

To deploy a program to the Solana blockchain, use the following command:

```bash
solana program deploy <PROGRAM_PATH>
```

## Bypassing Rate Limits

When requesting an airdrop, you may encounter rate limits. To bypass this limitation, you can use a loop to make multiple requests:

```bash
for i in {1..2}; do
  solana airdrop 0.5
done
```

This will request 0.5 SOL twice, resulting in a total of 1 SOL.