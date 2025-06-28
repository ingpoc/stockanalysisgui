'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'

interface BettingInterfaceProps {
  selectedChipValue: number
  onChipValueChange: (value: number) => void
  userBalance: number
  currentPot: number
  isSpinning: boolean
  onSpin: () => void
  onClear: () => void
  betsCount: number
  winningNumber: number | null
}

const CHIP_VALUES = [1, 5, 10, 25, 50, 100]

export function BettingInterface({
  selectedChipValue,
  onChipValueChange,
  userBalance,
  currentPot,
  isSpinning,
  onSpin,
  onClear,
  betsCount,
  winningNumber
}: BettingInterfaceProps) {
  const [showWinning, setShowWinning] = useState(false)

  // Show winning number animation
  useEffect(() => {
    if (winningNumber !== null) {
      setShowWinning(true)
      setTimeout(() => setShowWinning(false), 3000)
    }
  }, [winningNumber])

  return (
    <>
      {/* Main betting panel */}
      <motion.div 
        className="absolute right-4 top-4 bg-black/80 backdrop-blur-sm rounded-xl p-6 text-white min-w-[280px]"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          {/* User balance */}
          <div className="text-center">
            <p className="text-sm text-gray-300">Your Balance</p>
            <p className="text-2xl font-bold text-green-400">${userBalance}</p>
          </div>

          {/* Current pot */}
          <div className="text-center">
            <p className="text-sm text-gray-300">Current Pot</p>
            <motion.p 
              className="text-xl font-bold text-yellow-400"
              key={currentPot}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              ${currentPot}
            </motion.p>
          </div>

          {/* Chip selection */}
          <div>
            <p className="text-sm text-gray-300 mb-2">Select Chip Value</p>
            <div className="grid grid-cols-3 gap-2">
              {CHIP_VALUES.map((value) => (
                <motion.button
                  key={value}
                  onClick={() => onChipValueChange(value)}
                  disabled={value > userBalance || isSpinning}
                  className={`
                    relative h-12 w-12 rounded-full font-bold text-sm border-2 transition-all
                    ${selectedChipValue === value 
                      ? 'bg-yellow-500 border-yellow-300 text-black' 
                      : 'bg-gray-700 border-gray-500 text-white hover:bg-gray-600'
                    }
                    ${value > userBalance || isSpinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  whileHover={value <= userBalance && !isSpinning ? { scale: 1.1 } : {}}
                  whileTap={value <= userBalance && !isSpinning ? { scale: 0.95 } : {}}
                >
                  ${value}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Betting stats */}
          <div className="border-t border-gray-600 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Your Bets:</span>
              <span className="text-white">{betsCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Commission (2%):</span>
              <span className="text-red-400">${(currentPot * 0.02).toFixed(2)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <motion.button
              onClick={onSpin}
              disabled={isSpinning || betsCount === 0}
              className={`
                w-full py-3 px-4 rounded-lg font-bold transition-all
                ${isSpinning || betsCount === 0
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-green-600 hover:bg-green-500 text-white'
                }
              `}
              whileHover={!isSpinning && betsCount > 0 ? { scale: 1.02 } : {}}
              whileTap={!isSpinning && betsCount > 0 ? { scale: 0.98 } : {}}
            >
              {isSpinning ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Spinning...</span>
                </div>
              ) : (
                'SPIN'
              )}
            </motion.button>

            <motion.button
              onClick={onClear}
              disabled={isSpinning || betsCount === 0}
              className={`
                w-full py-2 px-4 rounded-lg font-medium transition-all
                ${isSpinning || betsCount === 0
                  ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                  : 'bg-red-600 hover:bg-red-500 text-white'
                }
              `}
              whileHover={!isSpinning && betsCount > 0 ? { scale: 1.02 } : {}}
              whileTap={!isSpinning && betsCount > 0 ? { scale: 0.98 } : {}}
            >
              Clear Bets
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Winning number announcement */}
      <AnimatePresence>
        {showWinning && winningNumber !== null && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-2xl text-center shadow-2xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20 
              }}
            >
              <h2 className="text-4xl font-bold mb-2">WINNING NUMBER</h2>
              <div className="text-8xl font-black mb-4">{winningNumber}</div>
              <p className="text-xl font-semibold">
                {winningNumber === 0 ? 'GREEN' : 
                 [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(winningNumber) ? 'RED' : 'BLACK'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions overlay for first-time users */}
      <motion.div 
        className="absolute left-4 bottom-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="font-bold mb-2">How to Play</h3>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>• Select chip value</li>
          <li>• Click numbers on table to bet</li>
          <li>• Press SPIN to start</li>
          <li>• 35:1 payout for single numbers</li>
          <li>• 2% commission to treasury</li>
        </ul>
      </motion.div>
    </>
  )
}