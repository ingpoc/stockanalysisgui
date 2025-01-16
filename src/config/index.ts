import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygon, optimism, arbitrum, mainnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

// Get projectId from environment
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Define networks - L2s prioritized
export const networks = [
  polygon,   // Lowest fees (~$0.01)
  optimism,  // Medium fees (~$0.50)
  arbitrum,  // Medium fees (~$0.30)
] as [AppKitNetwork, ...AppKitNetwork[]]

// Set up the Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks // Force Polygon as default
})

// Export wagmi config for use in providers
export const config = wagmiAdapter.wagmiConfig

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata: {
    name: 'Stock Analysis Dashboard',
    description: 'Real-time stock analysis and insights',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  },
  themeMode: 'dark',
  features: {
    analytics: true
  },
  defaultNetwork : polygon // Ensure Polygon is default in modal too
}) 