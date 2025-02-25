# Stock Analysis GUI

A comprehensive stock analysis dashboard built with Next.js that combines real-time market data with decentralized lottery features on the Solana blockchain.

## Features

- 📊 Real-time stock market dashboard
- 📈 Interactive stock charts and analysis
- 🤖 AI-powered market insights
- 🎲 Integrated decentralized lottery system
- 🌓 Dark/Light mode support
- 🔐 Secure authentication system
- 💱 Solana wallet integration

## Project Structure

```
src/
├── app/          # Next.js app router pages
├── components/   # React components
│   ├── auth/     # Authentication components
│   ├── layout/   # Layout components
│   ├── lottery/  # Solana lottery components
│   ├── stock/    # Stock analysis components
│   └── ui/       # Reusable UI components
├── hooks/        # Custom React hooks
├── lib/          # Utility functions and services
├── config/       # Configuration files
├── context/      # React context providers
├── types/        # TypeScript type definitions
└── assets/       # Static assets
```

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your environment variables:
   ```
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

   # Authentication & Project ID
   NEXT_PUBLIC_PROJECT_ID=your_project_id_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here

   # Blockchain Configuration
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

   # Lottery Program Configuration
   NEXT_PUBLIC_ADMIN_WALLET=your_admin_wallet_address_here
   NEXT_PUBLIC_TREASURY_WALLET=your_treasury_wallet_address_here
   NEXT_PUBLIC_LOTTERY_PROGRAM_ID=your_program_id_here
   NEXT_PUBLIC_USDC_MINT=your_usdc_mint_address_here
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

## Environment Variables

### App Configuration
- `NEXT_PUBLIC_APP_URL`: Base URL of the application
- `NEXT_PUBLIC_API_URL`: URL of the backend API

### Authentication
- `NEXT_PUBLIC_PROJECT_ID`: Project ID for authentication
- `NEXTAUTH_URL`: URL for NextAuth.js
- `NEXTAUTH_SECRET`: Secret for NextAuth.js

### Blockchain Configuration
- `NEXT_PUBLIC_SOLANA_NETWORK`: Solana network to use (devnet, testnet, mainnet)
- `NEXT_PUBLIC_SOLANA_RPC_URL`: URL of the Solana RPC endpoint
- `NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL`: URL of the Solana devnet RPC endpoint
- `NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL`: URL of the Solana mainnet RPC endpoint

### Lottery Program Configuration
- `NEXT_PUBLIC_ADMIN_WALLET`: Admin wallet address for the lottery program
- `NEXT_PUBLIC_TREASURY_WALLET`: Treasury wallet address for receiving lottery fees and funds
- `NEXT_PUBLIC_LOTTERY_PROGRAM_ID`: Program ID of the lottery program
- `NEXT_PUBLIC_USDC_MINT`: USDC mint address for the lottery program
- `NEXT_PUBLIC_GLOBAL_CONFIG_SEED`: Seed for the global config PDA
- `NEXT_PUBLIC_LOTTERY_SEED`: Seed for the lottery PDA
- `NEXT_PUBLIC_LOTTERY_TOKEN_SEED`: Seed for the lottery token PDA

### Feature Flags
- `NEXT_PUBLIC_ENABLE_CRYPTO_LOTTERY`: Enable/disable the crypto lottery feature

## Key Components

- **Stock Dashboard**: Real-time stock market monitoring and analysis
- **AI Insights**: Machine learning-powered market analysis and predictions
- **Lottery System**: Decentralized lottery implementation on Solana
- **Authentication**: Secure user authentication and authorization
- **Wallet Integration**: Solana wallet connection and transaction handling

## Technologies

- [Next.js](https://nextjs.org/) - React framework
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) - Solana blockchain integration
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- TypeScript - Type safety
- [Vercel](https://vercel.com) - Deployment platform

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
