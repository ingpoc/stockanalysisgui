import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Set up the Wagmi Adapter with cookie storage
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  networks: [mainnet]
})

// Create the AppKit instance
export const appKit = createAppKit({
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
})

// Export wagmi config for use in other parts of the application
export const config = wagmiAdapter.wagmiConfig 