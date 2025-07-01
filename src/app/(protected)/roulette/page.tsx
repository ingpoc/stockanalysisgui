'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuthNavigation } from '@/lib/navigation'
import { PageContainer } from '@/components/layout/page-container'
import { RouletteGameWrapper } from '@/components/roulette/roulette-game-wrapper'
import { useRoulette } from '@/hooks/useRoulette'
import { useRouletteProgram } from '@/hooks/use-roulette-program'
import { Button } from '@/components/ui/button'
import { isRouletteStateEqual, getRouletteStateDisplayName } from '@/types/roulette_types'
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
    isInitialized,
    initialize,
    createRoulette,
    isCreating,
    isInitializing
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
  const activePlayers = roulettes?.reduce((sum, roulette) => sum + (roulette.total_players?.toNumber() || 0), 0) || 0
  const totalPot = roulettes?.reduce((sum, roulette) => sum + ((roulette.total_bet_amount?.toNumber() || 0) / 1_000_000), 0) || 0
  const lastWinner = roulettes?.find(r => r.winning_number !== null)?.winning_number || null
  const activeGames = roulettes?.filter(r => 
    isRouletteStateEqual(r.state, 'open') || isRouletteStateEqual(r.state, 'locked')
  ).length || 0

  const handleInitialize = async () => {
    try {
      await initialize()
      toast.success('Roulette program initialized successfully!')
    } catch (error) {
      console.error('Failed to initialize roulette program:', error)
    }
  }

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
        <div className="flex gap-2">
          {isInitialized === false && (
            <Button onClick={handleInitialize} disabled={isInitializing} variant="outline">
              {isInitializing ? 'Initializing...' : 'Initialize Program'}
            </Button>
          )}
          <Button 
            onClick={handleCreateRoulette} 
            disabled={isCreating || isInitialized === false}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? 'Creating...' : 'Create Game'}
          </Button>
        </div>
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

      {/* Program Status */}
      {isInitialized !== undefined && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <strong>Program Status:</strong> {isInitialized ? 'Initialized ✅' : 'Not Initialized ❌'}
            {isInitialized === false && (
              <span className="ml-2 text-blue-600">
                → Click &quot;Initialize Program&quot; to set up the roulette program
              </span>
            )}
          </div>
        </div>
      )}

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
                    isRouletteStateEqual(roulette.state, 'open') ? 'bg-green-100 text-green-800' :
                    isRouletteStateEqual(roulette.state, 'locked') ? 'bg-yellow-100 text-yellow-800' :
                    isRouletteStateEqual(roulette.state, 'spinning') ? 'bg-blue-100 text-blue-800' :
                    isRouletteStateEqual(roulette.state, 'completed') ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getRouletteStateDisplayName(roulette.state)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Type</div>
                    <div className="font-medium">{roulette.roulette_type || 'European'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Min/Max Bet</div>
                    <div className="font-medium">${((roulette.min_bet?.toNumber() || 0) / 1_000_000).toFixed(2)} - ${((roulette.max_bet?.toNumber() || 0) / 1_000_000).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total Bets</div>
                    <div className="font-medium">{roulette.total_bets?.toNumber() || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Pot Size</div>
                    <div className="font-medium">${((roulette.total_bet_amount?.toNumber() || 0) / 1_000_000).toFixed(2)}</div>
                  </div>
                  {roulette.winning_number !== null && (
                    <div>
                      <div className="text-gray-500">Winning Number</div>
                      <div className="font-medium text-green-600">{roulette.winning_number}</div>
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
          <div className="text-gray-500 mb-4">
            {isInitialized === false 
              ? 'Program needs to be initialized first' 
              : 'No roulette games found'
            }
          </div>
          {isInitialized !== false && (
            <Button onClick={handleCreateRoulette} disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Game
            </Button>
          )}
        </div>
      )}

      {/* 3D Roulette Game - Keep existing for visual appeal */}
      <div className="h-[600px] mt-8">
        <RouletteGameWrapper playerWallet={publicKey?.toBase58()} />
      </div>
    </PageContainer>
  )
}