'use client'

import { useAppKit } from '@reown/appkit/react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LoginPage() {
  const { open } = useAppKit()
  const router = useRouter()
  const { isConnected, status } = useAccount()
  const [isConnecting, setIsConnecting] = useState(false)

  // Check connection status and redirect
  useEffect(() => {
    const checkConnection = async () => {
      if (isConnected) {
        router.replace('/dashboard')
      }
    }
    checkConnection()
  }, [isConnected, router])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await open()
    } catch (error) {
      console.error('Failed to connect:', error)
      setIsConnecting(false)
    }
  }

  // Show loading state during connection or transition
  if (isConnecting || isConnected || status === 'connecting') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">
            {isConnected ? 'Loading dashboard...' : 'Connecting wallet...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome to Stock Analysis Dashboard</h1>
        <p className="text-muted-foreground">Connect your wallet to continue</p>
        <Button 
          onClick={handleConnect}
          size="lg"
          className="w-full max-w-xs"
        >
          Connect Wallet
        </Button>
      </div>
    </div>
  )
} 