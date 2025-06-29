'use client'

import { RouletteGame3D } from './roulette-game-3d'

interface RouletteGameWrapperProps {
  playerWallet?: string
}

export function RouletteGameWrapper({ playerWallet }: RouletteGameWrapperProps) {
  // Force 3D zen roulette mode only - no fallbacks or dynamic imports
  console.log('Loading 3D Zen Roulette...')
  return (
    <div className="w-full h-full relative">
      <RouletteGame3D playerWallet={playerWallet} />
    </div>
  )
}