'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PageContainer } from '@/components/layout/page-container'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, Trophy, DollarSign, Users, Clock } from 'lucide-react'
import { useAuthNavigation } from '@/lib/navigation'
import { useLottery } from '@/hooks/useLottery'
import { ADMIN_WALLET } from '@/lib/constants'
import { AdminLotteryTable } from '@/components/admin/admin-lottery-table'
import { TreasuryDashboard } from '@/components/admin/treasury-dashboard'
import { AdminStats } from '@/components/admin/admin-stats'

export default function AdminPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { connected, publicKey } = useWallet()
  const navigation = useAuthNavigation()
  const {
    lotteries,
    isLoading,
    error
  } = useLottery()

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (isMounted && !connected) {
      navigation.toLogin('/admin')
    }
  }, [connected, navigation, isMounted])

  // Check if user is admin
  const isAdmin = publicKey?.toBase58() === ADMIN_WALLET

  if (!isMounted) {
    return null
  }

  if (!isAdmin) {
    return (
      <PageContainer>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have administrator privileges. Only the admin wallet can access this page.
          </AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Dieter Rams Header - Consistent with other pages */}
      <div className="mb-16">
        <div className="flex items-baseline justify-between pb-8 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-light text-gray-900 tracking-wide">
              ADMIN DASHBOARD
            </h1>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-2">
              LOTTERY MANAGEMENT & TREASURY OVERVIEW
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">ADMIN WALLET</div>
            <div className="text-sm font-mono text-gray-600">
              {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'An unknown error occurred'}</AlertDescription>
        </Alert>
      )}

      {/* Admin Stats Overview */}
      <AdminStats lotteries={lotteries || []} isLoading={isLoading} />

      {/* Clean Sections */}
      <div className="space-y-16">
        {/* Treasury Dashboard */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-8">TREASURY OVERVIEW</div>
          <TreasuryDashboard lotteries={lotteries || []} isLoading={isLoading} />
        </div>

        {/* Lottery Management Table */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-8">LOTTERY MANAGEMENT</div>
          <AdminLotteryTable lotteries={lotteries || []} isLoading={isLoading} />
        </div>
      </div>
    </PageContainer>
  )
}