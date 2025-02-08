'use client'

import { memo } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'
import { shortenAddress } from '@/lib/utils'

interface ConnectButtonProps {
  className?: string
}

const ConnectButton = memo(function ConnectButton({ className }: ConnectButtonProps) {
  const { open } = useAppKit()
  const { address, isConnected, status } = useAppKitAccount()

  return (
    <Button 
      onClick={() => open()}
      variant="secondary"
      className={className}
      disabled={status === 'connecting'}
    >
      {status === 'connecting' ? (
        'Connecting...'
      ) : isConnected && address ? (
        shortenAddress(address)
      ) : (
        'Connect Wallet'
      )}
    </Button>
  )
})

export default ConnectButton 