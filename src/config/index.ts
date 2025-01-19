import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "09fccb634332c292a3cb889c0592b928"

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [mainnet, arbitrum, solana, solanaDevnet, solanaTestnet] as [AppKitNetwork, ...AppKitNetwork[]]

// Set up the Wagmi Adapter with cookie storage
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

// Create the AppKit instance
/*export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  networks: [mainnet],
  themeMode: 'light',
  defaultNetwork: mainnet,
  metadata: {
    name: 'Stock Analysis Dashboard',
    description: 'Real-time stock analysis and insights',
    url: APP_URL,
    icons: [`${APP_URL}/icon.svg`]
  }
})*/

// Export wagmi config for use in other parts of the application
export const config = wagmiAdapter.wagmiConfig