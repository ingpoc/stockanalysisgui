'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { HyperRealisticCasino } from './hyper-realistic-casino'
import { CasinoRouletteTable } from './casino-roulette-table'
import { DealerModel } from './dealer-model'
import { EnhancedBettingInterface } from './enhanced-betting-interface'
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

  const handleDealerAction = (action: 'spin' | 'throw') => {
    console.log(`Dealer performed action: ${action}`)
    
    // Add visual feedback or sound effects based on dealer actions
    if (action === 'spin') {
      console.log('Dealer is spinning the wheel...')
    } else if (action === 'throw') {
      console.log('Dealer is throwing the ball...')
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* 3D Scene */}
      <Canvas
        camera={{ 
          position: [0, 6, 8], 
          fov: 60
        }}
        shadows
        gl={{ 
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          antialias: true
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            console.log('WebGL context lost, attempting to restore...')
          })
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored')
          })
        }}
      >
        {/* Modern Ambient Lighting */}
        <ambientLight intensity={0.4} color="#F8FAFC" />
        
        {/* Main modern ceiling lighting */}
        <pointLight
          position={[0, 6.5, 0]}
          intensity={6}
          color="#FFFFFF"
          distance={30}
          decay={2}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={0.1}
          shadow-camera-far={50}
        />
        
        {/* Clean table spotlight */}
        <spotLight
          position={[0, 4, 0]}
          intensity={10}
          angle={Math.PI / 4}
          penumbra={0.1}
          color="#FFFFFF"
          castShadow
          target-position={[0, 0.6, 0]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Modern side lighting */}
        <pointLight 
          position={[-12, 3, -8]} 
          intensity={3} 
          color="#F8FAFC" 
          distance={15}
          decay={2}
        />
        <pointLight 
          position={[12, 3, -8]} 
          intensity={3} 
          color="#F8FAFC" 
          distance={15}
          decay={2}
        />
        <pointLight 
          position={[-12, 3, 8]} 
          intensity={3} 
          color="#F8FAFC" 
          distance={15}
          decay={2}
        />
        <pointLight 
          position={[12, 3, 8]} 
          intensity={3} 
          color="#F8FAFC" 
          distance={15}
          decay={2}
        />
        
        {/* Architectural accent lighting */}
        <directionalLight
          position={[0, 10, -10]}
          intensity={1.5}
          color="#F5F5DC"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Rim lighting for depth */}
        <directionalLight
          position={[-15, 5, 5]}
          intensity={0.8}
          color="#DAA520"
        />
        <directionalLight
          position={[15, 5, 5]}
          intensity={0.8}
          color="#DAA520"
        />
        
        {/* Dealer area lighting */}
        <pointLight
          position={[-2, 3, 1]}
          intensity={6}
          color="#FFFACD"
          distance={12}
          decay={1.5}
          castShadow
        />
        
        {/* Additional dealer spotlight */}
        <spotLight
          position={[0, 5, -2]}
          intensity={12}
          angle={Math.PI / 3}
          penumbra={0.3}
          color="#FFFFFF"
          castShadow
          target-position={[0, 0.8, -3]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Dealer rim lighting */}
        <directionalLight
          position={[3, 4, -3]}
          intensity={4}
          color="#F5F5DC"
          castShadow
        />
        
        {/* Back lighting for dealer */}
        <pointLight
          position={[0, 3, -5]}
          intensity={4}
          color="#FFE4B5"
          distance={10}
          decay={2}
        />
        
        <Suspense fallback={null}>
          {/* Hyper-Realistic Casino Environment */}
          <HyperRealisticCasino />
          
          {/* Professional Casino Roulette Table */}
          <CasinoRouletteTable 
            isSpinning={isSpinning}
            winningNumber={winningNumber}
            selectedNumber={selectedNumber}
            onDealerAction={handleDealerAction}
          />
          
          {/* 3D Dealer Model */}
          <DealerModel
            onAction={handleDealerAction}
            isSpinning={isSpinning}
            position={[-2, 0, 1]}
            rotation={[0, Math.PI / 4, 0]}
            scale={0.8}
          />
          
          {/* Camera Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={15}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 1, 0]}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>

      {/* Enhanced Betting Interface */}
      <EnhancedBettingInterface
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
  )
}

