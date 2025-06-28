'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuthNavigation } from '@/lib/navigation'
import { RouletteGameWrapper } from '@/components/roulette/roulette-game-wrapper'
import { Activity, TrendingUp, Clock, Trophy } from 'lucide-react'

export default function RoulettePage() {
  const [isMounted, setIsMounted] = useState(false)
  const { connected, publicKey } = useWallet()
  const navigation = useAuthNavigation()

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

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-2xl font-light text-gray-900 tracking-wide mb-2">
              ROULETTE
            </h1>
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-6">
              DECENTRALIZED • SOLANA
            </p>
            <p className="text-gray-600 mb-8">
              Connect your wallet to start playing
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-gray-900 tracking-wide">
                ROULETTE
              </h1>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                DECENTRALIZED • SOLANA
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                INITIALIZE
              </button>
              <button className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                CREATE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">ACTIVE PLAYERS</p>
                <p className="text-2xl font-light text-gray-900 mt-1">12</p>
              </div>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">TOTAL POT</p>
                <p className="text-2xl font-light text-gray-900 mt-1">$2,450</p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">LAST WINNER</p>
                <p className="text-2xl font-light text-gray-900 mt-1">23</p>
              </div>
              <Trophy className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">TIME TO NEXT</p>
                <p className="text-2xl font-light text-gray-900 mt-1">2:45</p>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="container mx-auto px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <RouletteGameWrapper playerWallet={publicKey?.toBase58()} />
        </div>
      </div>
    </div>
  )
}