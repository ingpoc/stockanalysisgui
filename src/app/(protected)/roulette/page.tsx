'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuthNavigation } from '@/lib/navigation'
import { RouletteGameWrapper } from '@/components/roulette/roulette-game-wrapper'

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
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 tracking-wide mb-4">
            LUXURY ROULETTE
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            Connect your wallet to enter the luxury casino
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {/* Roulette Game - Full Height */}
      <div className="relative h-[calc(100vh-80px)] bg-gradient-to-b from-white via-gray-50 to-gray-100 overflow-hidden">
        <RouletteGameWrapper playerWallet={publicKey?.toBase58()} />
      </div>
    </div>
  )
}