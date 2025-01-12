'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isConnected, status } = useAccount()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'connecting') {
      return
    }

    if (isConnected) {
      router.replace('/dashboard')
    } else {
      setIsLoading(false)
    }
  }, [isConnected, status, router])

  if (isLoading || status === 'connecting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {children}
    </div>
  )
} 