'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, memo } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

function AuthGuardComponent({ children, requireAuth = true }: AuthGuardProps) {
  const { connected, connecting, disconnect } = useWallet()
  const router = useRouter()

  const handleAuthChange = useCallback(async () => {
    if (connecting) return

    try {
      if (requireAuth && !connected) {
        await router.replace('/auth/login')
      } else if (!requireAuth && connected) {
        await router.replace('/dashboard')
      }
    } catch (error) {
      console.error('Navigation error:', error)
      // If navigation fails, disconnect the wallet to maintain consistent state
      if (connected) {
        await disconnect()
      }
    }
  }, [connected, connecting, requireAuth, router, disconnect])

  useEffect(() => {
    handleAuthChange()
  }, [handleAuthChange])

  const getLoadingMessage = () => {
    if (connecting) return 'Connecting wallet...'
    if (requireAuth && !connected) return 'Please connect your wallet to continue'
    if (!requireAuth && connected) return 'Redirecting to dashboard...'
    return 'Loading...'
  }

  if (connecting || (requireAuth && !connected) || (!requireAuth && connected)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-muted-foreground">
            {getLoadingMessage()}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export const AuthGuard = memo(AuthGuardComponent) 