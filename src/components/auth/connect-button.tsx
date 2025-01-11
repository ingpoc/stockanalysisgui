'use client'

import { useAppKit } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'
import { useAccount } from 'wagmi'

export default function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

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