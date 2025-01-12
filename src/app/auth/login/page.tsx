'use client'

import { useAppKit } from '@reown/appkit/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const { open } = useAppKit()
  const router = useRouter()

  const handleConnect = async () => {
    try {
      await open()
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to connect:', error)
    }
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