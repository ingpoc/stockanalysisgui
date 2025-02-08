'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAppKitAccount, useAppKit } from '@reown/appkit/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status, isConnected } = useAppKitAccount()
  const { close } = useAppKit()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (status === 'connecting') return

    if (!isConnected) {
      router.replace('/auth/login')
    } else {
      setIsInitialized(true)
      // Close AppKit dialog when successfully connected
      close()
    }
  }, [isConnected, status, router, close])

  // Show loading state only during initial connection
  if (!isInitialized || status === 'connecting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-muted-foreground">
            {status === 'connecting' ? 'Connecting wallet...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
} 