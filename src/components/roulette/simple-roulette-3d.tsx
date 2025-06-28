'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { HyperRealisticCasino } from './hyper-realistic-casino'
import { CasinoRouletteTable } from './casino-roulette-table'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

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
  const [userBalance, setUserBalance] = useState(100)
  const [betAmount, setBetAmount] = useState(5)

  const getNumberColor = (num: number) => {
    if (num === 0) return '#059669'
    return RED_NUMBERS.includes(num) ? '#dc2626' : '#1f2937'
  }

  const placeBet = (number: number) => {
    if (isSpinning || betAmount > userBalance) return
    setSelectedNumber(number)
    setUserBalance(prev => prev - betAmount)
  }

  const spinWheel = () => {
    if (isSpinning || selectedNumber === null) return
    
    setIsSpinning(true)
    setWinningNumber(null)
    
    setTimeout(() => {
      const winner = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)]
      setWinningNumber(winner)
      
      if (winner === selectedNumber) {
        setUserBalance(prev => prev + (betAmount * 35))
      }
      
      setIsSpinning(false)
      
      setTimeout(() => {
        setSelectedNumber(null)
        setWinningNumber(null)
      }, 3000)
    }, 3000)
  }

  const handleDealerAction = (action: 'spin' | 'throw') => {
    console.log(`Dealer performed action: ${action}`)
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
        {/* Hyper-Realistic Casino Lighting */}
        <ambientLight intensity={0.15} color="#FFF8DC" />
        
        {/* Main dramatic chandelier lighting */}
        <pointLight
          position={[0, 6.5, 0]}
          intensity={4}
          color="#FFD700"
          distance={30}
          decay={2}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={0.1}
          shadow-camera-far={50}
        />
        
        {/* Focused table spotlight */}
        <spotLight
          position={[0, 4, 0]}
          intensity={8}
          angle={Math.PI / 4}
          penumbra={0.1}
          color="#FFFACD"
          castShadow
          target-position={[0, 0.6, 0]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Side sconce lighting */}
        <pointLight 
          position={[-12, 3, -8]} 
          intensity={2} 
          color="#FFA500" 
          distance={15}
          decay={2}
        />
        <pointLight 
          position={[12, 3, -8]} 
          intensity={2} 
          color="#FFA500" 
          distance={15}
          decay={2}
        />
        <pointLight 
          position={[-12, 3, 8]} 
          intensity={2} 
          color="#FFA500" 
          distance={15}
          decay={2}
        />
        <pointLight 
          position={[12, 3, 8]} 
          intensity={2} 
          color="#FFA500" 
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

      {/* UI Overlay */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-6 text-white min-w-[280px]">
        <div className="space-y-4">
          {/* Balance */}
          <div className="text-center">
            <p className="text-sm text-gray-300">Balance</p>
            <p className="text-2xl font-bold text-green-400">${userBalance}</p>
          </div>

          {/* Bet Amount */}
          <div>
            <p className="text-sm text-gray-300 mb-2">Bet Amount</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 10, 25].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={amount > userBalance}
                  className={`py-2 px-3 rounded font-semibold text-sm ${
                    betAmount === amount
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Number Grid */}
          <div>
            <p className="text-sm text-gray-300 mb-2">Select Number</p>
            <div className="grid grid-cols-6 gap-1 text-xs">
              {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => placeBet(num)}
                  disabled={isSpinning}
                  className={`h-8 font-bold text-white rounded transition-all ${
                    getNumberColor(num) === '#dc2626' ? 'bg-red-600' : 'bg-gray-800'
                  } ${selectedNumber === num ? 'ring-2 ring-yellow-400' : ''} ${
                    winningNumber === num ? 'ring-2 ring-green-400 animate-pulse' : ''
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            {/* Zero */}
            <button
              onClick={() => placeBet(0)}
              disabled={isSpinning}
              className={`w-full h-8 mt-2 font-bold text-white rounded bg-green-600 ${
                selectedNumber === 0 ? 'ring-2 ring-yellow-400' : ''
              } ${winningNumber === 0 ? 'ring-2 ring-green-400 animate-pulse' : ''}`}
            >
              0
            </button>
          </div>

          {/* Spin Button */}
          <button
            onClick={spinWheel}
            disabled={isSpinning || selectedNumber === null}
            className={`w-full py-3 px-4 rounded-lg font-bold ${
              isSpinning || selectedNumber === null
                ? 'bg-gray-600 text-gray-400'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {isSpinning ? 'SPINNING...' : selectedNumber !== null ? `SPIN! (Bet $${betAmount} on ${selectedNumber})` : 'SELECT NUMBER'}
          </button>
        </div>
      </div>

      {/* Winning Announcement */}
      <AnimatePresence>
        {winningNumber !== null && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black p-8 rounded-2xl text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
            >
              <h2 className="text-4xl font-bold mb-4">WINNING NUMBER</h2>
              <div className="text-8xl font-black mb-4">{winningNumber}</div>
              <p className="text-xl font-semibold mb-4">
                {winningNumber === 0 ? 'GREEN' : 
                 RED_NUMBERS.includes(winningNumber) ? 'RED' : 'BLACK'}
              </p>
              {winningNumber === selectedNumber ? (
                <p className="text-2xl font-bold text-green-800">YOU WIN! +${betAmount * 35}</p>
              ) : (
                <p className="text-xl font-semibold text-red-800">Better luck next time!</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

