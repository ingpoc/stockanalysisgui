'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RouletteFallbackProps {
  playerWallet?: string
}

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

export function RouletteFallback({ playerWallet }: RouletteFallbackProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningNumber, setWinningNumber] = useState<number | null>(null)
  const [userBalance, setUserBalance] = useState(100)
  const [betAmount, setBetAmount] = useState(5)
  const [wheelRotation, setWheelRotation] = useState(0)

  const getNumberColor = (num: number) => {
    if (num === 0) return 'bg-green-600'
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-gray-800'
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
    
    // Animate wheel
    const spins = 5 + Math.random() * 3
    const finalRotation = wheelRotation + (spins * 360)
    setWheelRotation(finalRotation)
    
    // Determine winner after animation
    setTimeout(() => {
      const winner = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)]
      setWinningNumber(winner)
      
      if (winner === selectedNumber) {
        setUserBalance(prev => prev + (betAmount * 35)) // 35:1 payout
      }
      
      setIsSpinning(false)
      
      // Reset after showing result
      setTimeout(() => {
        setSelectedNumber(null)
        setWinningNumber(null)
      }, 3000)
    }, 3000)
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      {/* Header */}
      <div className="text-center text-white mb-8">
        <h1 className="text-4xl font-bold mb-2">🎲 ZEN ROULETTE</h1>
        <p className="text-gray-300">2D Classic Mode • Fully Functional</p>
        <div className="mt-4 text-lg">
          Balance: <span className="text-green-400 font-bold">${userBalance}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Roulette Wheel */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            {/* Wheel */}
            <motion.div
              className="w-80 h-80 rounded-full border-8 border-yellow-500 bg-gradient-to-br from-yellow-600 to-yellow-800 relative overflow-hidden"
              animate={{ rotate: wheelRotation }}
              transition={{ duration: 3, ease: "easeOut" }}
            >
              {/* Wheel sectors */}
              {ROULETTE_NUMBERS.map((num, index) => {
                const angle = (index / ROULETTE_NUMBERS.length) * 360
                return (
                  <div
                    key={num}
                    className={`absolute w-2 h-16 origin-bottom ${getNumberColor(num)}`}
                    style={{
                      left: '50%',
                      bottom: '50%',
                      transformOrigin: 'bottom center',
                      transform: `translateX(-50%) rotate(${angle}deg)`
                    }}
                  >
                    <div className="text-white text-xs font-bold text-center mt-1">
                      {num}
                    </div>
                  </div>
                )
              })}
              
              {/* Center */}
              <div className="absolute inset-1/2 w-4 h-4 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white" />
            </div>
          </div>
        </div>

        {/* Betting Area */}
        <div className="flex-1">
          {/* Bet Amount Selector */}
          <div className="mb-6 text-center">
            <label className="block text-white text-sm font-semibold mb-2">Bet Amount</label>
            <div className="flex justify-center gap-2">
              {[1, 5, 10, 25].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={amount > userBalance}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    betAmount === amount
                      ? 'bg-yellow-500 text-black'
                      : amount > userBalance
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Number Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
              <motion.button
                key={num}
                onClick={() => placeBet(num)}
                disabled={isSpinning}
                className={`
                  h-12 font-bold text-white rounded-lg transition-all
                  ${getNumberColor(num)}
                  ${selectedNumber === num ? 'ring-4 ring-yellow-400' : ''}
                  ${winningNumber === num ? 'ring-4 ring-green-400 animate-pulse' : ''}
                  ${isSpinning ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
                `}
                whileHover={!isSpinning ? { scale: 1.05 } : {}}
                whileTap={!isSpinning ? { scale: 0.95 } : {}}
              >
                {num}
              </motion.button>
            ))}
          </div>

          {/* Zero */}
          <motion.button
            onClick={() => placeBet(0)}
            disabled={isSpinning}
            className={`
              w-full h-12 font-bold text-white rounded-lg mb-6 transition-all
              ${getNumberColor(0)}
              ${selectedNumber === 0 ? 'ring-4 ring-yellow-400' : ''}
              ${winningNumber === 0 ? 'ring-4 ring-green-400 animate-pulse' : ''}
              ${isSpinning ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
            `}
            whileHover={!isSpinning ? { scale: 1.02 } : {}}
          >
            0 - GREEN
          </motion.button>

          {/* Spin Button */}
          <motion.button
            onClick={spinWheel}
            disabled={isSpinning || selectedNumber === null}
            className={`
              w-full h-16 font-bold text-xl rounded-lg transition-all
              ${isSpinning || selectedNumber === null
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500'
              }
            `}
            whileHover={!isSpinning && selectedNumber !== null ? { scale: 1.02 } : {}}
            whileTap={!isSpinning && selectedNumber !== null ? { scale: 0.98 } : {}}
          >
            {isSpinning ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 border-3 border-gray-400 border-t-white rounded-full animate-spin" />
                SPINNING...
              </div>
            ) : selectedNumber !== null ? (
              `SPIN! (Bet $${betAmount} on ${selectedNumber})`
            ) : (
              'SELECT A NUMBER TO BET'
            )}
          </motion.button>

          {/* Current Bet Display */}
          {selectedNumber !== null && (
            <div className="mt-4 text-center text-white">
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-sm text-gray-300">Current Bet</p>
                <p className="text-xl font-bold">
                  ${betAmount} on <span className="text-yellow-400">{selectedNumber}</span>
                </p>
                <p className="text-sm text-gray-300">Potential win: ${betAmount * 35}</p>
              </div>
            </div>
          )}
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
              className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black p-8 rounded-2xl text-center shadow-2xl"
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

      {/* 3D Mode Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Try 3D Mode
        </button>
      </div>
    </div>
  )
}