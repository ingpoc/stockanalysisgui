import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from 'wagmi/chains'

export const appKit = createAppKit({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  networks: [mainnet],
  defaultNetwork: mainnet,
  metadata: {
    name: 'Stock Analysis Dashboard',
    description: 'Real-time stock analysis and insights',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    icons: ['https://your-icon-url.com/icon.png']
  },
  adapters: [
    new WagmiAdapter({
      ssr: true,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
      networks: [mainnet]
    })
  ]
}); 