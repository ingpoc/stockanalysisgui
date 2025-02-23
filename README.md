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
   # Required environment variables
   NEXT_PUBLIC_API_KEY=your_api_key
   NEXT_PUBLIC_SOLANA_RPC_URL=your_solana_rpc_url
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
