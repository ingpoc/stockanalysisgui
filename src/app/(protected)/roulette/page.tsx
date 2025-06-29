'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuthNavigation } from '@/lib/navigation'
import { PageContainer } from '@/components/layout/page-container'
import { RouletteGameWrapper } from '@/components/roulette/roulette-game-wrapper'
import { useRoulette } from '@/hooks/useRoulette'
import { useRouletteProgram } from '@/hooks/use-roulette-program'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, TrendingUp, Clock, Trophy, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function RoulettePage() {
  const [isMounted, setIsMounted] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { connected, publicKey } = useWallet()
  const navigation = useAuthNavigation()
  
  const {
    roulettes,
    isLoading,
    error,
    createRoulette,
    isCreating
  } = useRoulette()

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (isMounted && !connected) {
      navigation.toLogin('/roulette')
    }
  }, [connected, navigation, isMounted])

  if (!isMounted) {
    return null
  }

  // Calculate real stats from blockchain data
  const activePlayers = roulettes?.reduce((sum, roulette) => sum + roulette.totalPlayers, 0) || 0
  const totalPot = roulettes?.reduce((sum, roulette) => sum + (roulette.totalBetAmount / 1_000_000), 0) || 0
  const lastWinner = roulettes?.find(r => r.winningNumber !== null)?.winningNumber || null
  const activeGames = roulettes?.filter(r => r.state === 'Open' || r.state === 'Locked').length || 0

  const handleCreateRoulette = async () => {
    try {
      const nonce = Date.now() + Math.floor(Math.random() * 1000)
      await createRoulette({
        rouletteType: { european: {} } as any,
        minBet: 1_000_000, // 1 USDC in smallest unit
        maxBet: 100_000_000, // 100 USDC in smallest unit
        gameDuration: 300, // 5 minutes
        nonce
      })
      toast.success('Roulette game created successfully!')
    } catch (error) {
      console.error('Failed to create roulette:', error)
    }
  }

  return (
    <PageContainer>
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-gray-900">Roulette</h1>
        <Button onClick={handleCreateRoulette} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? 'Creating...' : 'Create Game'}
        </Button>
      </div>

      {/* Stats Grid - Real blockchain data */}
      <div className="grid grid-cols-4 gap-16 mb-16">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">ACTIVE PLAYERS</div>
          <div className="text-3xl font-light text-gray-900 font-mono">{activePlayers}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">TOTAL POT</div>
          <div className="text-3xl font-light text-gray-900 font-mono">${totalPot.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">LAST WINNER</div>
          <div className="text-3xl font-light text-gray-900 font-mono">{lastWinner || '--'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">ACTIVE GAMES</div>
          <div className="text-3xl font-light text-gray-900 font-mono">{activeGames}</div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading roulette games...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-500">Error loading roulette games: {error.message}</div>
        </div>
      )}

      {/* Roulette Games List */}
      {roulettes && roulettes.length > 0 && (
        <div className="grid gap-6 mb-8">
          {roulettes.map((roulette, index) => (
            <Card key={index} className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Roulette #{index + 1}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    roulette.state === 'Open' ? 'bg-green-100 text-green-800' :
                    roulette.state === 'Locked' ? 'bg-yellow-100 text-yellow-800' :
                    roulette.state === 'Spinning' ? 'bg-blue-100 text-blue-800' :
                    roulette.state === 'Completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {roulette.state}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Type</div>
                    <div className="font-medium">{Object.keys(roulette.rouletteType || {})[0]?.charAt(0).toUpperCase() + Object.keys(roulette.rouletteType || {})[0]?.slice(1) || 'European'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Min/Max Bet</div>
                    <div className="font-medium">${(roulette.minBet / 1_000_000).toFixed(2)} - ${(roulette.maxBet / 1_000_000).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total Bets</div>
                    <div className="font-medium">{roulette.totalBets}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Pot Size</div>
                    <div className="font-medium">${(roulette.totalBetAmount / 1_000_000).toFixed(2)}</div>
                  </div>
                  {roulette.winningNumber !== null && (
                    <div>
                      <div className="text-gray-500">Winning Number</div>
                      <div className="font-medium text-green-600">{roulette.winningNumber}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {roulettes && roulettes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No roulette games found</div>
          <Button onClick={handleCreateRoulette} disabled={isCreating}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Game
          </Button>
        </div>
      )}

      {/* 3D Roulette Game - Keep existing for visual appeal */}
      <div className="h-[600px] mt-8">
        <RouletteGameWrapper playerWallet={publicKey?.toBase58()} />
      </div>
    </PageContainer>
  )
}