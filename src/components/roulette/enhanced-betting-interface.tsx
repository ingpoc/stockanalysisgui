'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouletteAudio } from '@/hooks/useRouletteAudio'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Volume2, VolumeX, RotateCcw, Star, Clock, TrendingUp } from 'lucide-react'

interface Bet {
  id: string
  type: 'straight' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3' | 'column1' | 'column2' | 'column3' | 'neighbors'
  numbers: number[]
  amount: number
  payout: number
  label: string
}

interface BettingStats {
  totalBets: number
  totalWinnings: number
  winRate: number
  hotNumbers: number[]
  coldNumbers: number[]
  lastWinningNumbers: number[]
}

interface EnhancedBettingInterfaceProps {
  selectedChipValue: number
  onChipValueChange: (value: number) => void
  userBalance: number
  currentPot: number
  isSpinning: boolean
  onSpin: () => void
  onClear: () => void
  betsCount: number
  winningNumber: number | null
  onBetPlace: (bet: Bet) => void
  bets: Bet[]
}

const CHIP_VALUES = [1, 5, 10, 25, 50, 100]
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

// Roulette wheel order for neighbor bets
const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

// Get neighbor numbers on the wheel
const getNeighbors = (number: number, count: number = 2): number[] => {
  const index = WHEEL_ORDER.indexOf(number)
  if (index === -1) return [number]
  
  const neighbors: number[] = []
  for (let i = -count; i <= count; i++) {
    const neighborIndex = (index + i + WHEEL_ORDER.length) % WHEEL_ORDER.length
    neighbors.push(WHEEL_ORDER[neighborIndex])
  }
  return neighbors
}

export function EnhancedBettingInterface({
  selectedChipValue,
  onChipValueChange,
  userBalance,
  currentPot,
  isSpinning,
  onSpin,
  onClear,
  betsCount,
  winningNumber,
  onBetPlace,
  bets
}: EnhancedBettingInterfaceProps) {
  const [showStats, setShowStats] = useState(false)
  const [favoriteBets, setFavoriteBets] = useState<Bet[]>([])
  const [bettingStats, setBettingStats] = useState<BettingStats>({
    totalBets: 0,
    totalWinnings: 0,
    winRate: 0,
    hotNumbers: [17, 23, 8],
    coldNumbers: [2, 14, 31],
    lastWinningNumbers: []
  })
  const [autoBet, setAutoBet] = useState(false)
  const [showWinning, setShowWinning] = useState(false)
  
  const audio = useRouletteAudio()

  // Show winning number animation
  useEffect(() => {
    if (winningNumber !== null) {
      setShowWinning(true)
      setBettingStats(prev => ({
        ...prev,
        lastWinningNumbers: [winningNumber, ...prev.lastWinningNumbers.slice(0, 9)]
      }))
      
      // Check if player won
      const playerWon = bets.some(bet => bet.numbers.includes(winningNumber))
      if (playerWon) {
        audio.playWinSound()
        audio.playDealerVoice(`Number ${winningNumber} wins! Congratulations!`)
      } else {
        audio.playLoseSound()
        audio.playDealerVoice(`Number ${winningNumber}. Better luck next time!`)
      }
      
      setTimeout(() => setShowWinning(false), 3000)
    }
  }, [winningNumber, bets, audio])

  const placeBet = (type: Bet['type'], numbers: number[], payout: number, label: string) => {
    if (selectedChipValue > userBalance || isSpinning) return
    
    const bet: Bet = {
      id: `${type}-${Date.now()}`,
      type,
      numbers,
      amount: selectedChipValue,
      payout,
      label
    }
    
    onBetPlace(bet)
    audio.playChipSound()
  }

  const placeNumberBet = (number: number) => {
    placeBet('straight', [number], 35, `Number ${number}`)
  }

  const placeNeighborBet = (number: number) => {
    const neighbors = getNeighbors(number, 2) // 2 neighbors on each side
    const totalCost = neighbors.length * selectedChipValue
    
    if (totalCost > userBalance || isSpinning) return
    
    placeBet('neighbors', neighbors, 35, `${number} + Neighbors`)
    audio.playChipSound()
  }

  const saveFavoriteBet = () => {
    if (bets.length > 0) {
      setFavoriteBets(prev => [...prev, ...bets])
      audio.playChipSound()
    }
  }

  const repeatLastBet = () => {
    if (favoriteBets.length > 0) {
      favoriteBets.forEach(bet => onBetPlace({ ...bet, id: `${bet.type}-${Date.now()}` }))
      audio.playChipSound()
    }
  }

  const handleSpin = () => {
    audio.playSpinSound()
    audio.playDealerVoice("No more bets!")
    setTimeout(() => audio.playBallBouncingSound(), 1000)
    onSpin()
  }

  return (
    <>
      {/* Main betting panel */}
      <motion.div 
        className="absolute right-4 top-4 bg-black/90 backdrop-blur-sm rounded-xl p-6 text-white min-w-[320px] max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          {/* Header with audio controls */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-yellow-400">BETTING TERMINAL</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={audio.toggleBackgroundMusic}
                className="p-2"
              >
                {audio.isMusicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="p-2"
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Balance and pot */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-300">Balance</p>
              <p className="text-2xl font-bold text-green-400">${userBalance}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300">Total Pot</p>
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
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={repeatLastBet}
              disabled={favoriteBets.length === 0 || isSpinning}
              className="flex-1"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Repeat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={saveFavoriteBet}
              disabled={bets.length === 0 || isSpinning}
              className="flex-1"
            >
              <Star className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>

          {/* Chip selection */}
          <div>
            <p className="text-sm text-gray-300 mb-2">Chip Value</p>
            <div className="grid grid-cols-3 gap-2">
              {CHIP_VALUES.map((value) => (
                <motion.button
                  key={value}
                  onClick={() => {
                    onChipValueChange(value)
                    audio.playChipSound()
                  }}
                  disabled={value > userBalance || isSpinning}
                  className={`
                    relative h-12 w-full rounded-full font-bold text-sm border-2 transition-all
                    ${selectedChipValue === value 
                      ? 'bg-yellow-500 border-yellow-300 text-black shadow-lg' 
                      : 'bg-gray-700 border-gray-500 text-white hover:bg-gray-600'
                    }
                    ${value > userBalance || isSpinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  whileHover={value <= userBalance && !isSpinning ? { scale: 1.05 } : {}}
                  whileTap={value <= userBalance && !isSpinning ? { scale: 0.95 } : {}}
                >
                  ${value}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Number grid for straight bets */}
          <div>
            <p className="text-sm text-gray-300 mb-2">Single Numbers (35:1)</p>
            <div className="grid grid-cols-6 gap-1 text-xs">
              {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => placeNumberBet(num)}
                  disabled={isSpinning}
                  className={`h-8 font-bold text-white rounded transition-all ${
                    RED_NUMBERS.includes(num) ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-800 hover:bg-gray-700'
                  } ${winningNumber === num ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            {/* Zero */}
            <div className="grid grid-cols-2 gap-1 mt-2">
              <button
                onClick={() => placeNumberBet(0)}
                disabled={isSpinning}
                className={`h-8 font-bold text-white rounded bg-green-600 hover:bg-green-500 ${
                  winningNumber === 0 ? 'ring-2 ring-yellow-400 animate-pulse' : ''
                }`}
              >
                0
              </button>
              <button
                onClick={() => placeNeighborBet(0)}
                disabled={isSpinning}
                className="h-8 font-bold text-white rounded bg-green-500 hover:bg-green-400 text-xs"
                title="0 + Neighbors (32, 15)"
              >
                0 + N
              </button>
            </div>
          </div>

          {/* Neighbor Bets Section */}
          <div>
            <p className="text-sm text-gray-300 mb-2">Quick Neighbor Bets</p>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {[17, 23, 8, 29, 12, 35].map(num => (
                <button
                  key={`neighbor-${num}`}
                  onClick={() => placeNeighborBet(num)}
                  disabled={isSpinning}
                  className="h-8 font-bold text-white rounded bg-purple-600 hover:bg-purple-500 transition-all"
                  title={`${num} + 4 neighbors (costs ${5 * selectedChipValue})`}
                >
                  {num}+N
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Neighbor bets cover the selected number + 2 neighbors on each side
            </p>
          </div>

          {/* Outside bets */}
          <div>
            <p className="text-sm text-gray-300 mb-2">Outside Bets</p>
            <div className="space-y-2">
              {/* Red/Black, Odd/Even */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => placeBet('red', RED_NUMBERS, 1, 'Red')}
                  disabled={isSpinning}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  RED (1:1)
                </Button>
                <Button
                  onClick={() => placeBet('black', BLACK_NUMBERS, 1, 'Black')}
                  disabled={isSpinning}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold"
                >
                  BLACK (1:1)
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => placeBet('odd', [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35], 1, 'Odd')}
                  disabled={isSpinning}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  ODD (1:1)
                </Button>
                <Button
                  onClick={() => placeBet('even', [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36], 1, 'Even')}
                  disabled={isSpinning}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  EVEN (1:1)
                </Button>
              </div>

              {/* Low/High */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => placeBet('low', Array.from({length: 18}, (_, i) => i + 1), 1, '1-18')}
                  disabled={isSpinning}
                  variant="outline"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                >
                  1-18 (1:1)
                </Button>
                <Button
                  onClick={() => placeBet('high', Array.from({length: 18}, (_, i) => i + 19), 1, '19-36')}
                  disabled={isSpinning}
                  variant="outline"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                >
                  19-36 (1:1)
                </Button>
              </div>

              {/* Dozens */}
              <div className="grid grid-cols-3 gap-1">
                <Button
                  onClick={() => placeBet('dozen1', Array.from({length: 12}, (_, i) => i + 1), 2, '1st 12')}
                  disabled={isSpinning}
                  variant="outline"
                  className="text-xs border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  1st 12 (2:1)
                </Button>
                <Button
                  onClick={() => placeBet('dozen2', Array.from({length: 12}, (_, i) => i + 13), 2, '2nd 12')}
                  disabled={isSpinning}
                  variant="outline"
                  className="text-xs border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  2nd 12 (2:1)
                </Button>
                <Button
                  onClick={() => placeBet('dozen3', Array.from({length: 12}, (_, i) => i + 25), 2, '3rd 12')}
                  disabled={isSpinning}
                  variant="outline"
                  className="text-xs border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  3rd 12 (2:1)
                </Button>
              </div>

              {/* Columns */}
              <div className="grid grid-cols-3 gap-1">
                <Button
                  onClick={() => placeBet('column1', [1,4,7,10,13,16,19,22,25,28,31,34], 2, 'Col 1')}
                  disabled={isSpinning}
                  variant="outline"
                  className="text-xs border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                >
                  2 to 1
                </Button>
                <Button
                  onClick={() => placeBet('column2', [2,5,8,11,14,17,20,23,26,29,32,35], 2, 'Col 2')}
                  disabled={isSpinning}
                  variant="outline"
                  className="text-xs border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                >
                  2 to 1
                </Button>
                <Button
                  onClick={() => placeBet('column3', [3,6,9,12,15,18,21,24,27,30,33,36], 2, 'Col 3')}
                  disabled={isSpinning}
                  variant="outline"
                  className="text-xs border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                >
                  2 to 1
                </Button>
              </div>
            </div>
          </div>

          {/* Current bets */}
          {bets.length > 0 && (
            <div>
              <p className="text-sm text-gray-300 mb-2">Active Bets</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {bets.map(bet => (
                  <div key={bet.id} className="flex justify-between items-center text-xs bg-gray-800 p-2 rounded">
                    <span>{bet.label}</span>
                    <Badge variant="secondary">${bet.amount}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-600 pt-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Win Rate:</span>
                  <span className="text-green-400">{bettingStats.winRate}%</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Hot Numbers:</p>
                  <div className="flex gap-1">
                    {bettingStats.hotNumbers.map(num => (
                      <Badge key={num} variant="destructive" className="text-xs">{num}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Recent Winners:</p>
                  <div className="flex gap-1 flex-wrap">
                    {bettingStats.lastWinningNumbers.slice(0, 5).map((num, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{num}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <motion.button
              onClick={handleSpin}
              disabled={isSpinning || betsCount === 0}
              className={`
                w-full py-3 px-4 rounded-lg font-bold transition-all
                ${isSpinning || betsCount === 0
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-lg'
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
                'SPIN THE WHEEL'
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
              Clear All Bets
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Winning number announcement */}
      <AnimatePresence>
        {showWinning && winningNumber !== null && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
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
              <p className="text-xl font-semibold mb-4">
                {winningNumber === 0 ? 'GREEN' : 
                 RED_NUMBERS.includes(winningNumber) ? 'RED' : 'BLACK'}
              </p>
              {bets.some(bet => bet.numbers.includes(winningNumber)) ? (
                <motion.p 
                  className="text-2xl font-bold text-green-800"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🎉 YOU WIN! 🎉
                </motion.p>
              ) : (
                <p className="text-xl font-semibold text-red-800">Better luck next time!</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions overlay */}
      <motion.div 
        className="absolute left-4 bottom-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="font-bold mb-2 text-yellow-400">How to Play</h3>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>🎯 Select chip value & place bets</li>
          <li>🎲 Single numbers pay 35:1</li>
          <li>🔴 Red/Black, Odd/Even pay 1:1</li>
          <li>📊 Dozens & Columns pay 2:1</li>
          <li>🔊 Click audio icon for sound</li>
          <li>⭐ Save favorite bet patterns</li>
        </ul>
      </motion.div>
    </>
  )
}