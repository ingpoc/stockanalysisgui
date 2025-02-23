'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect, memo, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

function AuthGuardComponent({ children, requireAuth = true }: AuthGuardProps) {
  const { connected, connecting } = useWallet()
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleNavigation = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      router.replace(path)
    }
  }, [router])

  const checkAuth = useCallback((): string | null => {
    if (!isMounted) return null
    
    const isAuthPage = pathname === '/auth/login'
    
    if (requireAuth && !connected && !isAuthPage) {
      return '/auth/login'
    }
    
    if (!requireAuth && connected && isAuthPage) {
      return '/dashboard'
    }
    
    return null
  }, [connected, requireAuth, pathname, isMounted])

  useEffect(() => {
    if (isMounted) {
      const redirectPath = checkAuth()
      if (redirectPath) {
        handleNavigation(redirectPath)
      }
    }
  }, [checkAuth, isMounted, handleNavigation])

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