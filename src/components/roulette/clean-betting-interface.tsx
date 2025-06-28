'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouletteAudio } from '@/hooks/useRouletteAudio'
import { Volume2, VolumeX, RotateCcw, TrendingUp, ChevronRight } from 'lucide-react'

interface Bet {
  id: string
  type: 'straight' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3' | 'column1' | 'column2' | 'column3' | 'neighbors'
  numbers: number[]
  amount: number
  payout: number
  label: string
}

interface CleanBettingInterfaceProps {
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

export function CleanBettingInterface({
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
}: CleanBettingInterfaceProps) {
  const [showStats, setShowStats] = useState(false)
  const audio = useRouletteAudio()

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
    placeBet('straight', [number], 35, `${number}`)
  }

  return (
    <>
      {/* Main betting panel - Clean design */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Panel - Balance & Pot */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">GAME INFO</h3>
                <button
                  onClick={audio.toggleBackgroundMusic}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {audio.isMusicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">BALANCE</p>
                  <p className="text-2xl font-light text-gray-900">${userBalance}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">TOTAL POT</p>
                  <p className="text-2xl font-light text-gray-900">${currentPot}</p>
                </div>
              </div>

              {/* Chip Selection */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">CHIP VALUE</p>
                <div className="grid grid-cols-3 gap-2">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => {
                        onChipValueChange(value)
                        audio.playChipSound()
                      }}
                      disabled={value > userBalance || isSpinning}
                      className={`
                        relative h-10 rounded-lg font-medium text-sm transition-all
                        ${selectedChipValue === value 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }
                        ${value > userBalance || isSpinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      ${value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={onSpin}
                  disabled={isSpinning || betsCount === 0}
                  className={`
                    w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center
                    ${isSpinning || betsCount === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                    }
                  `}
                >
                  {isSpinning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                      SPINNING...
                    </>
                  ) : (
                    'SPIN THE WHEEL'
                  )}
                </button>

                <button
                  onClick={onClear}
                  disabled={isSpinning || betsCount === 0}
                  className={`
                    w-full py-2 px-4 rounded-lg font-medium transition-all
                    ${isSpinning || betsCount === 0
                      ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  CLEAR ALL BETS
                </button>
              </div>
            </div>

            {/* Middle Panel - Number Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">SINGLE NUMBERS (35:1)</h3>
              
              {/* Number Grid */}
              <div>
                <div className="grid grid-cols-12 gap-1 mb-2">
                  {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => placeNumberBet(num)}
                      disabled={isSpinning}
                      className={`
                        h-8 text-xs font-medium rounded transition-all
                        ${RED_NUMBERS.includes(num) 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }
                        ${winningNumber === num ? 'ring-2 ring-green-500' : ''}
                        ${isSpinning ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                
                {/* Zero */}
                <button
                  onClick={() => placeNumberBet(0)}
                  disabled={isSpinning}
                  className={`
                    w-full h-8 font-medium rounded bg-green-600 hover:bg-green-700 text-white transition-all
                    ${winningNumber === 0 ? 'ring-2 ring-green-500' : ''}
                    ${isSpinning ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                  `}
                >
                  0
                </button>
              </div>

              {/* Current Bets */}
              {bets.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">ACTIVE BETS</h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {bets.map(bet => (
                      <div key={bet.id} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded">
                        <span className="text-gray-700">{bet.label}</span>
                        <span className="font-medium text-gray-900">${bet.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Outside Bets */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">OUTSIDE BETS</h3>
              
              <div className="space-y-2">
                {/* Red/Black */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => placeBet('red', RED_NUMBERS, 1, 'RED')}
                    disabled={isSpinning}
                    className="py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-all disabled:opacity-50"
                  >
                    RED (1:1)
                  </button>
                  <button
                    onClick={() => placeBet('black', BLACK_NUMBERS, 1, 'BLACK')}
                    disabled={isSpinning}
                    className="py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-all disabled:opacity-50"
                  >
                    BLACK (1:1)
                  </button>
                </div>
                
                {/* Odd/Even */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => placeBet('odd', [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35], 1, 'ODD')}
                    disabled={isSpinning}
                    className="py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded transition-all disabled:opacity-50"
                  >
                    ODD (1:1)
                  </button>
                  <button
                    onClick={() => placeBet('even', [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36], 1, 'EVEN')}
                    disabled={isSpinning}
                    className="py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded transition-all disabled:opacity-50"
                  >
                    EVEN (1:1)
                  </button>
                </div>

                {/* Low/High */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => placeBet('low', Array.from({length: 18}, (_, i) => i + 1), 1, '1-18')}
                    disabled={isSpinning}
                    className="py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded transition-all disabled:opacity-50"
                  >
                    1-18 (1:1)
                  </button>
                  <button
                    onClick={() => placeBet('high', Array.from({length: 18}, (_, i) => i + 19), 1, '19-36')}
                    disabled={isSpinning}
                    className="py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded transition-all disabled:opacity-50"
                  >
                    19-36 (1:1)
                  </button>
                </div>

                {/* Dozens */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">DOZENS (2:1)</p>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => placeBet('dozen1', Array.from({length: 12}, (_, i) => i + 1), 2, '1ST')}
                      disabled={isSpinning}
                      className="py-2 px-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded transition-all disabled:opacity-50"
                    >
                      1ST
                    </button>
                    <button
                      onClick={() => placeBet('dozen2', Array.from({length: 12}, (_, i) => i + 13), 2, '2ND')}
                      disabled={isSpinning}
                      className="py-2 px-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded transition-all disabled:opacity-50"
                    >
                      2ND
                    </button>
                    <button
                      onClick={() => placeBet('dozen3', Array.from({length: 12}, (_, i) => i + 25), 2, '3RD')}
                      disabled={isSpinning}
                      className="py-2 px-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded transition-all disabled:opacity-50"
                    >
                      3RD
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Play - Minimal */}
      <motion.div 
        className="absolute top-4 left-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4 max-w-xs"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <h3 className="text-sm font-medium text-gray-900 mb-2">HOW TO PLAY</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Select chip value & place bets</li>
          <li>• Single numbers pay 35:1</li>
          <li>• Red/Black, Odd/Even pay 1:1</li>
          <li>• Dozens pay 2:1</li>
        </ul>
      </motion.div>
    </>
  )
}
