import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, polygon, optimism, arbitrum } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

// Set up the Wagmi Adapter with multichain support
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  networks: [mainnet, polygon, optimism, arbitrum]
})

// Create the AppKit instance with multichain support
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  networks: [mainnet, polygon, optimism, arbitrum],
  defaultNetwork: mainnet,
  metadata: {
    name: 'Stock Analysis Dashboard',
    description: 'Real-time stock analysis and insights',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    icons: ['https://your-icon-url.com/icon.png']
  }
})

// Export wagmi config for use in other parts of the application
export const config = wagmiAdapter.wagmiConfig

// Export supported networks for use in components
export const supportedNetworks = [mainnet, polygon, optimism, arbitrum] 