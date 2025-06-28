'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthNavigation } from '@/lib/navigation'
import { useFadeIn } from '@/hooks/useGSAP'
import { RouletteGameWrapper } from '@/components/roulette/roulette-game-wrapper'

export default function RoulettePage() {
  const [isMounted, setIsMounted] = useState(false)
  const { connected, publicKey } = useWallet()
  const navigation = useAuthNavigation()
  const headerRef = useFadeIn(0.2)

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
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-light text-gray-900 tracking-wide mb-4">
              LUXURY ROULETTE
            </h1>
            <p className="text-sm text-gray-600 mb-8">
              Connect your wallet to enter the luxury casino
            </p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Zen Header */}
      <div ref={headerRef} className="mb-8">
        <div className="flex items-baseline justify-between pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-light text-gray-900 tracking-wide">
              LUXURY ROULETTE
            </h1>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-2">
              CRYSTAL CHANDELIERS • CASINO ATMOSPHERE
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">PLAYER</div>
            <div className="text-sm font-mono text-gray-600">
              {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
            </div>
          </div>
        </div>
      </div>

      {/* Roulette Game */}
      <div className="relative h-[80vh] bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
        <RouletteGameWrapper playerWallet={publicKey?.toBase58()} />
      </div>
    </PageContainer>
  )
}