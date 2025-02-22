'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { connected, connecting } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!connecting && !connected) {
      router.replace('/auth/login')
    }
  }, [connected, connecting, router])

  // Show loading state while checking authentication
  if (connecting || !connected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return <>{children}</>
} 