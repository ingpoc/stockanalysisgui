'use client'

import { memo } from 'react'
import { useAppKit, useAppKitAccount } from '@/config'
import { Button } from '@/components/ui/button'
import { shortenAddress } from '@/lib/utils'

interface ConnectButtonProps {
  className?: string
}

const ConnectButton = memo(function ConnectButton({ className }: ConnectButtonProps) {
  const { open } = useAppKit()
  const { address, isConnected, status } = useAppKitAccount()

  const handleConnect = () => {
    try {
      open({
        view: 'Connect'
      })
    } catch (error) {
      console.error('Failed to open connect modal:', error)
    }
  }

  return (
    <Button 
      onClick={handleConnect}
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