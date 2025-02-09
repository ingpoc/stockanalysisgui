'use client'

import { useEffect, useState } from 'react'
import { useAppKitAccount, useAppKitProvider, useAppKitNetwork } from '@reown/appkit/react'
import { LotteryCard } from '@/components/lottery/lottery-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateLotteryDialog } from '@/components/lottery/create-lottery-dialog'
import { LotteryProgram } from '@/lib/solana/program'
import { LotteryInfo, LotteryType } from '@/types/lottery'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Connection, PublicKey } from '@solana/web3.js'
import { solana } from '@reown/appkit/networks'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useLotteryProgram } from '@/hooks/useLotteryProgram'
export function LotteryDashboard() {
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('solana')
  const { switchNetwork, caipNetwork } = useAppKitNetwork()
  const [lotteries, setLotteries] = useState<LotteryInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<LotteryType>(LotteryType.Daily)

  // Use the correct RPC URL based on the selected network
  const connection = new Connection(solana.rpcUrls.default.http[0], {
    commitment: 'confirmed'
  })

  const fetchLotteries = async () => {
    if (!isConnected || !address || !walletProvider) {
      setError('Please connect your wallet to view lotteries')
      setLoading(false)
      return
    }

    // Check if we're on Solana network
    if (caipNetwork?.id !== solana.id) {
      setError('Please switch to Solana network')
      try {
        await switchNetwork(solana)
      } catch (error) {
        console.error('Failed to switch network:', error)
      }
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const program = useLotteryProgram()

      const lotteries = await program.getLotteries()
      setLotteries(lotteries)
    } catch (error) {
      console.error('Error fetching lotteries:', error)
      setError(LotteryProgram.formatError(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLotteries()
  }, [connection, address, walletProvider, isConnected, caipNetwork])

  const filteredLotteries = lotteries.filter(lottery => 
    lottery.lotteryType === selectedType
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
                  key={lottery.address}
                  lottery={lottery}
                  onParticipate={fetchLotteries}
                />
              ))}
              {filteredLotteries.length === 0 && !error && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No daily lotteries found.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLotteries.map((lottery) => (
                <LotteryCard 
                  key={lottery.address}
                  lottery={lottery}
                  onParticipate={fetchLotteries}
                />
              ))}
              {filteredLotteries.length === 0 && !error && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No weekly lotteries found.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLotteries.map((lottery) => (
                <LotteryCard 
                  key={lottery.address}
                  lottery={lottery}
                  onParticipate={fetchLotteries}
                />
              ))}
              {filteredLotteries.length === 0 && !error && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No monthly lotteries found.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end">
        <CreateLotteryDialog onSuccess={fetchLotteries} />
      </div>
    </div>
  )
} 