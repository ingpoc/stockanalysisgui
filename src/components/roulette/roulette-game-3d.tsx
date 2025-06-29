'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  ContactShadows
} from '@react-three/drei'
import { Physics } from '@react-three/cannon'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { SimpleRouletteWheel } from './simple-roulette-wheel'

interface RouletteGame3DProps {
  playerWallet?: string
}

interface Bet {
  id: string
  player: string
  amount: number
  number: number
  position: [number, number, number]
}

interface GameState {
  isSpinning: boolean
  currentPot: number
  winningNumber: number | null
  bets: Bet[]
  players: string[]
}

export function RouletteGame3D({ playerWallet }: RouletteGame3DProps) {
  const [gameState, setGameState] = useState<GameState>({
    isSpinning: false,
    currentPot: 0,
    winningNumber: null,
    bets: [],
    players: playerWallet ? [playerWallet] : []
  })

  const [selectedChipValue, setSelectedChipValue] = useState(1)
  const [userBalance, setUserBalance] = useState(100) // Mock balance

  // No error boundary - force 3D mode to work
  useEffect(() => {
    console.log('3D Zen Roulette component loaded successfully')
  }, [])

  // Handle placing bets
  const placeBet = (number: number, position: [number, number, number]) => {
    if (!playerWallet || selectedChipValue > userBalance || gameState.isSpinning) return

    const newBet: Bet = {
      id: `${playerWallet}-${number}-${Date.now()}`,
      player: playerWallet,
      amount: selectedChipValue,
      number,
      position
    }

    setGameState(prev => ({
      ...prev,
      bets: [...prev.bets, newBet],
      currentPot: prev.currentPot + selectedChipValue
    }))

    setUserBalance(prev => prev - selectedChipValue)
  }

  // Handle roulette spin
  const spinRoulette = () => {
    if (gameState.isSpinning || gameState.bets.length === 0) return

    setGameState(prev => ({ ...prev, isSpinning: true, winningNumber: null }))
  }

  // Handle ball settling and determine winner
  const handleBallSettled = (winningNumber: number) => {
    setGameState(prev => {
      const winners = prev.bets.filter(bet => bet.number === winningNumber)
      const commission = prev.currentPot * 0.02
      const prizePool = prev.currentPot - commission

      // Distribute winnings (simplified - in real app would use smart contract)
      if (winners.length > 0) {
        const payoutPerWinner = prizePool / winners.length
        console.log(`Winning number: ${winningNumber}`)
        console.log(`Winners: ${winners.length}`)
        console.log(`Payout per winner: $${payoutPerWinner.toFixed(2)}`)
        
        // Award winnings to current player if they won
        const playerWinnings = winners
          .filter(bet => bet.player === playerWallet)
          .reduce((sum, bet) => sum + (payoutPerWinner * 35), 0) // 35:1 payout for single numbers
        
        if (playerWinnings > 0) {
          setUserBalance(balance => balance + playerWinnings)
        }
      }

      // Clear game after a delay to show results
      setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          bets: [],
          currentPot: 0,
          winningNumber: null,
          isSpinning: false
        }))
      }, 3000)

      return {
        ...prev,
        winningNumber,
        isSpinning: false
      }
    })
  }

  // Clear all bets
  const clearBets = () => {
    if (gameState.isSpinning) return
    
    const totalRefund = gameState.bets
      .filter(bet => bet.player === playerWallet)
      .reduce((sum, bet) => sum + bet.amount, 0)
    
    setUserBalance(prev => prev + totalRefund)
    setGameState(prev => ({
      ...prev,
      bets: prev.bets.filter(bet => bet.player !== playerWallet),
      currentPot: prev.currentPot - totalRefund
    }))
  }

  // Simple elegant roulette wheel with GSAP animations
  return (
    <div className="w-full h-full">
      <SimpleRouletteWheel playerWallet={playerWallet} />
    </div>
  )
}