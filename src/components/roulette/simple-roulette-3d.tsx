'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Box, Plane } from '@react-three/drei'
import { MinimalRouletteTable } from './minimal-roulette-table'
import { CleanBettingInterface } from './clean-betting-interface'
import { useRouletteAudio } from '@/hooks/useRouletteAudio'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

interface Bet {
  id: string
  type: 'straight' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3' | 'column1' | 'column2' | 'column3' | 'neighbors'
  numbers: number[]
  amount: number
  payout: number
  label: string
}

interface SimpleRoulette3DProps {
  playerWallet?: string
}

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

export function SimpleRoulette3D({ playerWallet }: SimpleRoulette3DProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningNumber, setWinningNumber] = useState<number | null>(null)
  const [userBalance, setUserBalance] = useState(1000) // Increased starting balance
  const [betAmount, setBetAmount] = useState(5)
  const [bets, setBets] = useState<Bet[]>([])
  const [currentPot, setCurrentPot] = useState(0)
  
  const audio = useRouletteAudio()

  const getNumberColor = (num: number) => {
    if (num === 0) return '#059669'
    return RED_NUMBERS.includes(num) ? '#dc2626' : '#1f2937'
  }

  const placeBet = (bet: Bet) => {
    if (isSpinning || bet.amount > userBalance) return
    
    setBets(prev => [...prev, bet])
    setCurrentPot(prev => prev + bet.amount)
    setUserBalance(prev => prev - bet.amount)
    
    // If it's a straight bet, also set selectedNumber for visual feedback
    if (bet.type === 'straight') {
      setSelectedNumber(bet.numbers[0])
    }
  }
  
  const clearBets = () => {
    if (isSpinning) return
    
    const totalRefund = bets.reduce((sum, bet) => sum + bet.amount, 0)
    setUserBalance(prev => prev + totalRefund)
    setBets([])
    setCurrentPot(0)
    setSelectedNumber(null)
  }

  const spinWheel = () => {
    if (isSpinning || bets.length === 0) return
    
    setIsSpinning(true)
    setWinningNumber(null)
    
    // Play spinning sound
    audio.playSpinSound()
    audio.playDealerVoice("No more bets!")
    
    setTimeout(() => {
      const winner = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)]
      setWinningNumber(winner)
      
      // Calculate winnings
      let totalWinnings = 0
      let hasWon = false
      
      bets.forEach(bet => {
        if (bet.numbers.includes(winner)) {
          const payout = bet.amount * (bet.payout + 1) // +1 to include original bet
          totalWinnings += payout
          hasWon = true
        }
      })
      
      if (hasWon) {
        setUserBalance(prev => prev + totalWinnings)
        audio.playWinSound()
        audio.playDealerVoice(`Number ${winner} wins! Congratulations!`)
      } else {
        audio.playLoseSound()
        audio.playDealerVoice(`Number ${winner}. Better luck next time!`)
      }
      
      setIsSpinning(false)
      
      // Clear bets after showing results
      setTimeout(() => {
        setBets([])
        setCurrentPot(0)
        setSelectedNumber(null)
        setWinningNumber(null)
      }, 4000)
    }, 3000)
  }

  return (
    <div className="relative w-full h-[600px]">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ 
            position: [0, 8, 10], 
            fov: 50
          }}
          shadows
          gl={{ 
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            antialias: true,
            alpha: true
          }}
        >
          {/* Clean, minimal lighting */}
          <ambientLight intensity={0.6} color="#FFFFFF" />
          
          {/* Soft directional light */}
          <directionalLight
            position={[5, 10, 5]}
            intensity={0.8}
            color="#FFFFFF"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Subtle rim light */}
          <directionalLight
            position={[-5, 5, -5]}
            intensity={0.3}
            color="#E5E7EB"
          />
          
          <Suspense fallback={null}>
            {/* Minimal Environment */}
            <group>
              {/* Clean floor */}
              <Plane 
                args={[50, 50]} 
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[0, -0.5, 0]}
                receiveShadow
              >
                <meshStandardMaterial color="#F9FAFB" roughness={0.8} />
              </Plane>
              
              {/* Subtle background */}
              <Plane 
                args={[50, 30]} 
                position={[0, 10, -15]}
              >
                <meshStandardMaterial color="#F3F4F6" roughness={1} />
              </Plane>
            </group>
            
            {/* Minimal Roulette Table */}
            <MinimalRouletteTable
              isSpinning={isSpinning}
              winningNumber={winningNumber}
              selectedNumber={selectedNumber}
            />
            
            {/* Camera Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={8}
              maxDistance={20}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.5}
              target={[0, 0, 0]}
              autoRotate={false}
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Clean Betting Interface - Overlay style */}
      <div className="absolute inset-x-0 bottom-0">
        <CleanBettingInterface
          selectedChipValue={betAmount}
          onChipValueChange={setBetAmount}
          userBalance={userBalance}
          currentPot={currentPot}
          isSpinning={isSpinning}
          onSpin={spinWheel}
          onClear={clearBets}
          betsCount={bets.length}
          winningNumber={winningNumber}
          onBetPlace={placeBet}
          bets={bets}
        />
      </div>

      {/* Winning Announcement - Minimal Style */}
      <AnimatePresence>
        {winningNumber !== null && !isSpinning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">WINNING NUMBER</p>
              <div className="text-6xl font-light text-gray-900 mb-2">{winningNumber}</div>
              <p className="text-lg text-gray-600">
                {winningNumber === 0 ? 'GREEN' : 
                 RED_NUMBERS.includes(winningNumber) ? 'RED' : 'BLACK'}
              </p>
              {bets.some(bet => bet.numbers.includes(winningNumber)) && (
                <motion.div 
                  className="mt-4 text-green-600 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Congratulations! You won!
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

