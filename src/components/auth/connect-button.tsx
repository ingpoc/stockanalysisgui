'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'

export default function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  return (
    <Button 
      onClick={() => open()}
      variant="secondary"
    >
      {isConnected && address ? 
        `${address.slice(0, 6)}...${address.slice(-4)}` : 
        'Connect Wallet'
      }
    </Button>
  )
} 