'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAppKitAccount } from '@reown/appkit/react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useAppKitAccount()

  // Show loading state during connection
  if (status === 'connecting' || status === 'reconnecting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
} 