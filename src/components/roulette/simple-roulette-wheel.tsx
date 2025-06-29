'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useRouletteAudio } from '@/hooks/useRouletteAudio'
import { motion, AnimatePresence } from 'framer-motion'

interface Bet {
  id: string
  type: 'straight' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3' | 'column1' | 'column2' | 'column3' | 'neighbors'
  numbers: number[]
  amount: number
  payout: number
  label: string
}

interface SimpleRouletteWheelProps {
  playerWallet?: string
}

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export function SimpleRouletteWheel({ playerWallet }: SimpleRouletteWheelProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningNumber, setWinningNumber] = useState<number | null>(null)
  const [userBalance, setUserBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(5)
  const [bets, setBets] = useState<Bet[]>([])
  const [currentPot, setCurrentPot] = useState(0)
  
  const wheelRef = useRef<HTMLDivElement>(null)
  const ballRef = useRef<HTMLDivElement>(null)
  const audio = useRouletteAudio()

  const getNumberColor = (num: number) => {
    if (num === 0) return 'bg-green-600'
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-gray-900'
  }

  const placeBet = (bet: Bet) => {
    if (isSpinning || bet.amount > userBalance) return
    
    setBets(prev => [...prev, bet])
    setCurrentPot(prev => prev + bet.amount)
    setUserBalance(prev => prev - bet.amount)
    
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
    
    audio.playSpinSound()
    audio.playDealerVoice("No more bets!")
    
    // Get winning number
    const winner = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)]
    const winnerIndex = ROULETTE_NUMBERS.indexOf(winner)
    
    // Calculate spin rotation
    const degreesPerSlice = 360 / ROULETTE_NUMBERS.length
    const finalRotation = 1800 + (winnerIndex * degreesPerSlice) // 5 full rotations + final position
    
    // Animate wheel with GSAP
    if (wheelRef.current) {
      gsap.to(wheelRef.current, {
        rotation: finalRotation,
        duration: 3,
        ease: "power3.out"
      })
    }
    
    // Animate ball with GSAP
    if (ballRef.current) {
      const timeline = gsap.timeline()
      const radius = 130
      
      // Ball spins fast initially around the wheel
      timeline.to(ballRef.current, {
        rotation: -1800,
        duration: 2.5,
        ease: "power2.out",
        transformOrigin: `${-radius + 6}px 6px`
      })
      
      // Ball settles into winning pocket
      const finalAngle = winnerIndex * degreesPerSlice
      const finalX = Math.cos((finalAngle - 90) * Math.PI / 180) * radius
      const finalY = Math.sin((finalAngle - 90) * Math.PI / 180) * radius
      
      timeline.to(ballRef.current, {
        left: `calc(50% + ${finalX}px - 6px)`,
        top: `calc(50% + ${finalY}px - 6px)`,
        rotation: -finalAngle,
        duration: 0.5,
        ease: "bounce.out"
      }, "-=0.5")
    }
    
    setTimeout(() => {
      setWinningNumber(winner)
      
      // Calculate winnings
      let totalWinnings = 0
      let hasWon = false
      
      bets.forEach(bet => {
        if (bet.numbers.includes(winner)) {
          const payout = bet.amount * (bet.payout + 1)
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Roulette Wheel Container */}
      <div className="flex-[2] flex items-center justify-center px-4 py-6">
        <div className="relative w-[400px] h-[400px]">
          {/* Outer Rim */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-600 to-amber-800 p-4 shadow-2xl">
            
            {/* Wheel */}
            <div 
              ref={wheelRef}
              className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-white relative shadow-inner overflow-visible"
              style={{ transformOrigin: '50% 50%' }}
            >
              {/* Numbers around the wheel */}
              {ROULETTE_NUMBERS.map((number, index) => {
                const angle = (index / ROULETTE_NUMBERS.length) * 360
                const radius = 130 // 130px radius for 400px wheel
                const x = Math.cos((angle - 90) * Math.PI / 180) * radius
                const y = Math.sin((angle - 90) * Math.PI / 180) * radius
                const isSelected = selectedNumber === number
                const isWinner = winningNumber === number
                
                return (
                  <div
                    key={number}
                    className={`absolute w-7 h-7 flex items-center justify-center text-white text-xs font-bold rounded-sm ${getNumberColor(number)} ${isSelected ? 'ring-2 ring-blue-400' : ''} ${isWinner ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                    style={{
                      left: `calc(50% + ${x}px - 14px)`,
                      top: `calc(50% + ${y}px - 14px)`,
                      transform: `rotate(${angle}deg)`
                    }}
                  >
                    <span style={{ transform: `rotate(-${angle}deg)` }}>
                      {number}
                    </span>
                  </div>
                )
              })}
              
              {/* Ball Track */}
              <div className="absolute inset-6 rounded-full border-2 border-amber-700 border-opacity-30"></div>
              
              {/* Center Hub */}
              <div className="absolute top-1/2 left-1/2 w-10 h-10 -ml-5 -mt-5 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
              </div>
            </div>
          </div>
          
          {/* Ball */}
          <div
            ref={ballRef}
            className="absolute w-3 h-3 pointer-events-none"
            style={{ 
              left: 'calc(50% + 130px - 6px)',
              top: 'calc(50% - 6px)',
              transformOrigin: '6px 6px'
            }}
          >
            <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
          </div>
          
          {/* Pointer */}
          <div className="absolute top-1 left-1/2 -ml-1.5 w-3 h-6 bg-gradient-to-b from-amber-600 to-amber-800 clip-triangle"></div>
        </div>
      </div>

      {/* Simple Betting Interface */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-500">Balance:</span>
              <span className="ml-2 font-mono font-semibold">${userBalance}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Pot:</span>
              <span className="ml-2 font-mono font-semibold">${currentPot}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearBets}
              disabled={isSpinning || bets.length === 0}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded"
            >
              Clear ({bets.length})
            </button>
            <button
              onClick={spinWheel}
              disabled={isSpinning || bets.length === 0}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded font-semibold"
            >
              {isSpinning ? 'Spinning...' : 'SPIN'}
            </button>
          </div>
        </div>
      </div>

      {/* Winning Announcement */}
      <AnimatePresence>
        {winningNumber !== null && !isSpinning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center"
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