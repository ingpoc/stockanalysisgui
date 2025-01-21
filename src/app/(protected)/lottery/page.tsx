import { Suspense } from 'react'
import { LotteryDashboard } from '@/components/lottery/lottery-dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LotteryPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Crypto Lottery</h1>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <LotteryDashboard />
      </Suspense>
    </div>
  )
} 