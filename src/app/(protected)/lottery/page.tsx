'use client'

import { useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { LotteryInfo, LotteryType } from '@/types/lottery'
import { PageContainer } from '@/components/layout/page-container'
import { LotteryCard } from '@/components/lottery/lottery-card'
import { CreateLotteryDialog } from '@/components/lottery/create-lottery-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { LotteryProgram } from '@/lib/solana/program'
import { handleProgramError } from '@/lib/utils'

export default function LotteryPage() {
  const [lotteries, setLotteries] = useState<LotteryInfo[]>([])
  const [loading, setLoading] = useState(true)
  const { connection } = useConnection()
  const { publicKey, wallet } = useWallet()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchLotteries()
  }, [connection, publicKey, wallet])

  const fetchLotteries = async () => {
    try {
      setLoading(true)
      const adapter = wallet?.adapter as BaseSignerWalletAdapter
      if (!connection || !publicKey || !adapter) return

      const program = new LotteryProgram(connection, {
        publicKey,
        signTransaction: adapter.signTransaction.bind(adapter),
        signAllTransactions: adapter.signAllTransactions.bind(adapter),
      })

      const lotteries = await program.getLotteries()
      setLotteries(lotteries)
    } catch (error) {
      console.error('Failed to fetch lotteries:', error)
      toast.error(handleProgramError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Crypto Lottery</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Participate in decentralized lotteries on Solana
          </p>
        </div>
        
        {publicKey && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Lottery
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          ))
        ) : (
          lotteries.map((lottery) => (
            <LotteryCard 
              key={lottery.address} 
              lottery={lottery}
              onParticipate={fetchLotteries}
            />
          ))
        )}
      </div>

      <CreateLotteryDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchLotteries}
      />
    </PageContainer>
  )
} 