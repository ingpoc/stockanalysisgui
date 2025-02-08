'use client'

import { useEffect, useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { LotteryCard } from '@/components/lottery/lottery-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateLotteryDialog } from '@/components/lottery/create-lottery-dialog'
import { useLotteryProgram } from '@/lib/solana/program'
import { LotteryAccount, LotteryAccountData, LotteryType } from '@/types/lottery'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { PublicKey } from '@solana/web3.js'
import type { ProgramAccount } from '@coral-xyz/anchor'
import { CryptoLotteryProgram } from '@/types/crypto_lottery_program' 

export function LotteryDashboard() {
  const { address } = useAppKitAccount()
  const [lotteries, setLotteries] = useState<LotteryAccount[]>([])
  const [loading, setLoading] = useState(true)
  const program = useLotteryProgram()
  const [selectedType, setSelectedType] = useState<LotteryType>(LotteryType.Daily)

  const fetchLotteries = async () => {
    if (!program) return
    
    try {
      setLoading(true)
      const accounts = await program.account.lotteryAccount.all() as ProgramAccount<LotteryAccountData>[]
      setLotteries(accounts.map(acc => ({
        ...acc.account,
        publicKey: acc.publicKey
      })))
    } catch (error) {
      console.error('Error fetching lotteries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLotteries()
  }, [program])

  const filteredLotteries = lotteries.filter(lottery => 
    lottery.lotteryType === selectedType
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="daily" className="w-full">
          <TabsList>
            <TabsTrigger 
              value="daily" 
              onClick={() => setSelectedType(LotteryType.Daily)}
            >
              Daily Lottery
            </TabsTrigger>
            <TabsTrigger 
              value="weekly"
              onClick={() => setSelectedType(LotteryType.Weekly)}
            >
              Weekly Lottery
            </TabsTrigger>
            <TabsTrigger 
              value="monthly"
              onClick={() => setSelectedType(LotteryType.Monthly)}
            >
              Monthly Lottery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLotteries.map((lottery) => (
                <LotteryCard 
                  key={lottery.publicKey.toString()} 
                  lottery={lottery}
                  onUpdate={fetchLotteries}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLotteries.map((lottery) => (
                <LotteryCard 
                  key={lottery.publicKey.toString()} 
                  lottery={lottery}
                  onUpdate={fetchLotteries}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLotteries.map((lottery) => (
                <LotteryCard 
                  key={lottery.publicKey.toString()} 
                  lottery={lottery}
                  onUpdate={fetchLotteries}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {address && <CreateLotteryDialog onCreated={fetchLotteries} />}
    </div>
  )
} 