import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo, type ReactNode, createElement } from 'react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SOLANA_NETWORK, SOLANA_RPC_URL } from '@/lib/constants'

// Load styles
require('@solana/wallet-adapter-react-ui/styles.css')

// Get network and RPC endpoint from constants
const NETWORK = SOLANA_NETWORK as WalletAdapterNetwork
const RPC_ENDPOINT = SOLANA_RPC_URL || clusterApiUrl(NETWORK)

export function WalletConnectionProvider({ children }: { children: ReactNode }) {
  // Initialize wallets for the provider
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  )

  const modalProvider = createElement(WalletModalProvider, { children })
  const walletProvider = createElement(WalletProvider, { 
    wallets, 
    autoConnect: true,
    children: modalProvider 
  })
  
  return createElement(ConnectionProvider, {
    endpoint: RPC_ENDPOINT,
    children: walletProvider
  })
}

// Export commonly used values
export const LAMPORTS_PER_SOL = 1000000000 // 1 SOL = 1 billion lamports 