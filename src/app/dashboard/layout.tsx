'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isConnected, status } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'connecting' && !isConnected) {
      router.replace('/auth/login')
    }
  }, [isConnected, status, router])

  // Show loading state while checking authentication
  if (status === 'connecting' || !isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return <>{children}</>
} 