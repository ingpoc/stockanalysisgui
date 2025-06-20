'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useLottery } from '@/hooks/useLottery'
import { LotteryCard } from '@/components/lottery/lottery-card'
import { CreateLotteryDialog } from '@/components/lottery/create-lottery-dialog'
import { InitializeProgramDialog } from '@/components/lottery/initialize-program-dialog'
import { AdminLotteryControls } from '@/components/lottery/admin-lottery-controls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Dice6 } from 'lucide-react'
import { useState } from 'react'
import { ADMIN_WALLET } from '@/lib/constants'

export default function DashboardPage() {
  const { connected, publicKey } = useWallet()
  const { lotteries, isLoading } = useLottery()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showInitDialog, setShowInitDialog] = useState(false)
  
  const isAdmin = publicKey?.toBase58() === ADMIN_WALLET

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Dice6 className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Welcome to Crypto Lottery</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Connect your Solana wallet to participate in decentralized lotteries and win USDC prizes!
          </p>
          <WalletMultiButton />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Crypto Lottery Dashboard</h1>
          <p className="text-muted-foreground">
            Participate in decentralized lotteries on Solana
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button 
                onClick={() => setShowInitDialog(true)}
                variant="outline"
              >
                Initialize Program
              </Button>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Lottery
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : lotteries && lotteries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotteries.map((lottery) => (
            <LotteryCard
              key={lottery.address}
              lottery={lottery}
              onParticipate={() => {}}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Lotteries Available</CardTitle>
            <CardDescription>
              {isAdmin 
                ? "Create the first lottery to get started!" 
                : "Check back later for new lottery opportunities."
              }
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <CreateLotteryDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      
      <InitializeProgramDialog
        open={showInitDialog}
        onOpenChange={setShowInitDialog}
      />
    </div>
  )
} 