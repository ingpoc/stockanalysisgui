'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, memo, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthNavigation, isValidReturnUrl } from '@/lib/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

function AuthGuardComponent({ children, requireAuth = true }: AuthGuardProps) {
  const { connected, connecting } = useWallet()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)
  const navigation = useAuthNavigation()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const checkAuth = useCallback((): string | null => {
    if (!isMounted) return null
    
    const isAuthPage = pathname === '/auth/login'
    const returnUrl = searchParams.get('returnTo')
    
    if (requireAuth && !connected && !isAuthPage) {
      return `/auth/login${returnUrl ? `?returnTo=${returnUrl}` : ''}`
    }
    
    if (!requireAuth && connected && isAuthPage) {
      return returnUrl && isValidReturnUrl(returnUrl) ? returnUrl : '/dashboard'
    }
    
    return null
  }, [connected, requireAuth, pathname, isMounted, searchParams])

  useEffect(() => {
    if (isMounted) {
      const redirectPath = checkAuth()
      if (redirectPath) {
        navigation.toProtectedRoute(redirectPath)
      }
    }
  }, [checkAuth, isMounted, navigation])

  // Don't render anything until mounted
  if (!isMounted) {
    return null
  }

  // Show loading only during wallet connection
  if (connecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-muted-foreground">Connecting wallet...</p>
        </div>
      </div>
    )
  }

  // If auth check returns a path, we're redirecting, so render nothing
  const redirectPath = checkAuth()
  if (redirectPath !== null) {
    return null
  }

  return <>{children}</>
}

export const AuthGuard = memo(AuthGuardComponent) 