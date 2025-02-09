import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygon, optimism, arbitrum, mainnet, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { createAppKit, useAppKit, useAppKitState, useAppKitTheme, useAppKitEvents, useAppKitAccount, useWalletInfo, useAppKitNetwork, useDisconnect } from '@reown/appkit/react'


export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "09fccb634332c292a3cb889c0592b928"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Define networks - L2s prioritized
export const networks = [
  polygon,   // Lowest fees (~$0.01)
  optimism,  // Medium fees (~$0.50)
  arbitrum,  // Medium fees (~$0.30)
  mainnet,
  solana,
  solanaDevnet,
  solanaTestnet
] as [AppKitNetwork, ...AppKitNetwork[]]

// Set up the Wagmi Adapter with cookie storage
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks // Force Polygon as default
})

export const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const metadata = {
  name: 'Stock Analysis Dashboard',
  description: 'Real-time stock analysis and insights',
  url: APP_URL,
  icons: [`${APP_URL}/icon.svg`]
}

const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  projectId,
  networks,
  metadata,
  themeMode: 'dark',
  features: {
    email: true, // default to true
    socials: ['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook'],
    emailShowWallets: true, // default to true
    analytics: true // Optional - defaults to your Cloud configuration
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  }
})

// Export wagmi config for use in other parts of the application
export {
  modal,
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork,
  useDisconnect
}