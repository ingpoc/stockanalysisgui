'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isConnected, status } = useAppKitAccount()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'connecting') {
      return
    }

    if (!isConnected) {
      router.push('/auth/login')
    } else {
      setIsLoading(false)
    }
  }, [isConnected, status, router])

  // Show loading state while checking authentication or during initial load
  if (isLoading || status === 'connecting' || !isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    )
  }

  return <>{children}</>
} 