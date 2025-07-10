# Crypto Lottery DApp

A decentralized lottery platform built on Solana blockchain using Next.js, enabling users to participate in transparent, verifiable lotteries with USDC prizes.

## Features

- 🎲 Decentralized lottery system on Solana
- 💰 USDC-based prize pools
- 🔍 Transparent and verifiable outcomes
- 🌓 Dark/Light mode support
- 🔐 Secure wallet authentication
- 💱 Multi-wallet support (Phantom, Solflare, etc.)
- ⚡ Real-time lottery updates
- 🛡️ Admin controls for lottery management

## Project Structure

```
src/
├── app/          # Next.js app router pages
├── components/   # React components
│   ├── auth/     # Authentication components
│   ├── layout/   # Layout components
│   ├── lottery/  # Lottery-specific components
│   └── ui/       # Reusable UI components
├── hooks/        # Custom React hooks
├── lib/          # Utility functions and services
│   └── solana/   # Solana program integration
├── types/        # TypeScript type definitions
└── assets/       # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Solana CLI tools
- A Solana wallet (Phantom recommended)
- Some SOL for transaction fees
- Some devnet USDC for testing

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd crypto-lottery-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local`:

   ```bash
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Blockchain Configuration
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

   # Lottery Program Configuration
   NEXT_PUBLIC_ADMIN_WALLET=7Q3UBDfjZgNJNCQBdJrji33f2FvtJ1z3DErcAV6hFsf4
   NEXT_PUBLIC_LOTTERY_PROGRAM_ID=9SL8XkX3pvqZ2fjiLMhCFfQn7Gfmpd9ru8rtHFsAPVgq
   NEXT_PUBLIC_USDC_MINT=Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr

   # Optional: Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here
   ```

5. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser

## Environment Variables

### Required

- `NEXT_PUBLIC_SOLANA_NETWORK`: Solana network (devnet/mainnet-beta)
- `NEXT_PUBLIC_SOLANA_RPC_URL`: Solana RPC endpoint
- `NEXT_PUBLIC_LOTTERY_PROGRAM_ID`: Deployed lottery program ID
- `NEXT_PUBLIC_USDC_MINT`: USDC token mint address

### Optional

- `NEXT_PUBLIC_ADMIN_WALLET`: Admin wallet for lottery management
- `NEXT_PUBLIC_TREASURY_WALLET`: Treasury wallet (defaults to admin wallet)
- `NEXTAUTH_URL`: NextAuth.js URL
- `NEXTAUTH_SECRET`: NextAuth.js secret

## How It Works

### For Users

1. **Connect Wallet**: Connect your Solana wallet (Phantom, Solflare, etc.)
2. **Browse Lotteries**: View active lotteries with their details
3. **Buy Tickets**: Purchase lottery tickets using USDC
4. **Check Results**: View lottery outcomes and claim prizes if you win

### For Admins

1. **Initialize Program**: Set up the lottery program (one-time)
2. **Create Lotteries**: Set up new lotteries with custom parameters
3. **Manage State**: Transition lotteries through their lifecycle
4. **Draw Winners**: Execute random winner selection

### Lottery Lifecycle

1. **Created** → Admin creates lottery
2. **Open** → Users can buy tickets
3. **Locked** → Ticket sales end
4. **Drawing** → Random winner selection begins
5. **AwaitingRandomness** → Waiting for VRF randomness
6. **Completed** → Winner determined, prizes claimable

## Key Components

### Lottery Components

- **LotteryCard**: Display individual lottery information
- **CreateLotteryDialog**: Admin interface for creating lotteries
- **AdminLotteryControls**: Management interface for lottery lifecycle
- **InitializeProgramDialog**: One-time program setup

### Integration

- **Solana Program**: Custom Rust program for lottery logic
- **Anchor Framework**: Type-safe Solana program interaction
- **Wallet Integration**: Multi-wallet adapter support
- **Real-time Updates**: React Query for data synchronization

## Technologies

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components
- **Blockchain**: Solana Web3.js, Anchor framework
- **State Management**: React Query (TanStack Query)
- **Wallet**: Solana Wallet Adapter
- **Authentication**: NextAuth.js (optional)

## Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

### Frontend Deployment

Deploy to Vercel, Netlify, or similar:

```bash
npm run build
```

### Program Deployment

The Solana program is deployed separately using Anchor:

```bash
cd ../decentralized-lottery
anchor build
anchor deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

### Phase 1: Core Lottery ✅

- [x] Basic lottery functionality
- [x] Ticket purchasing
- [x] Winner selection
- [x] Prize claiming

### Phase 2: Enhanced Features 🚧

- [ ] Multiple lottery types
- [ ] Advanced admin features
- [ ] Better UX/UI improvements
- [ ] Mobile optimization

### Phase 3: Prediction Markets 🔜

- [ ] Binary outcome markets
- [ ] AMM-based pricing
- [ ] Real-world event integration
- [ ] Oracle system integration

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
