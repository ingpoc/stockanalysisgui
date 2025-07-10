'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { useRoulette } from '@/hooks/useRoulette';
import { useConnection } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Bet {
  id: string;
  label: string;
  numbers: number[];
  amount: number;
  type: BetType;
  payout: number;
  player?: string;
}

interface GameState {
  state: 'idle' | 'open' | 'locked' | 'spinning' | 'revealing' | 'settled';
  winningNumber: number | null;
  spinTime?: number;
  revealTime?: number;
}

export type BetType =
  | 'straight'
  | 'red'
  | 'black'
  | 'odd'
  | 'even'
  | 'low'
  | 'high'
  | 'dozen1'
  | 'dozen2'
  | 'dozen3'
  | 'column1'
  | 'column2'
  | 'column3'
  | 'neighbors'
  | 'split'
  | 'street'
  | 'corner'
  | 'sixline'
  | 'column'
  | 'dozen'
  | 'lowhigh'
  | 'oddeven'
  | 'redblack';

interface SimpleRouletteWheelProps {
  playerWallet?: string;
  gameState: GameState;
  isSpinning: boolean;
  winningNumber: number | null;
  onPlaceBet?: (bet: Omit<Bet, 'player'>) => Promise<void>;
  onSpinComplete?: () => void;
}

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

export function SimpleRouletteWheel({
  playerWallet,
  gameState,
  isSpinning,
  winningNumber: propWinningNumber,
  onPlaceBet,
  onSpinComplete = () => {},
}: SimpleRouletteWheelProps) {
  const [localWinningNumber, setLocalWinningNumber] = useState<number | null>(
    null
  );
  const [userBalance, setUserBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(5);
  const [bets, setBets] = useState<Array<Omit<Bet, 'player'>>>([]);
  const [currentPot, setCurrentPot] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout>();

  const startSpinAnimation = useCallback((winner: number | null) => {
    if (winner === null || winner === undefined) return;

    setLocalWinningNumber(null);

    const winnerIndex = ROULETTE_NUMBERS.indexOf(winner);
    const degreesPerSlice = 360 / ROULETTE_NUMBERS.length;
    const fullRotations = 5;
    const finalRotation = 360 * fullRotations + winnerIndex * degreesPerSlice;

    if (wheelRef.current) {
      gsap.to(wheelRef.current, {
        rotation: finalRotation,
        duration: 3,
        ease: 'power3.out',
      });
    }

    if (ballRef.current) {
      const radius = 130;
      const finalAngle = winnerIndex * degreesPerSlice;
      const finalX = Math.cos(((finalAngle - 90) * Math.PI) / 180) * radius;
      const finalY = Math.sin(((finalAngle - 90) * Math.PI) / 180) * radius;

      gsap.set(ballRef.current, {
        left: `calc(50% + 130px - 6px)`,
        top: `calc(50% - 6px)`,
        rotation: 0,
      });

      gsap.to(ballRef.current, {
        rotation: -finalRotation,
        duration: 2.8,
        ease: 'power2.out',
        transformOrigin: `${-radius + 6}px 6px`,
      });

      gsap.to(ballRef.current, {
        left: `calc(50% + ${finalX}px - 6px)`,
        top: `calc(50% + ${finalY}px - 6px)`,
        rotation: -finalAngle,
        duration: 0.5,
        delay: 2.5,
        ease: 'power2.out',
      });
    }
  }, []);

  const handleSpinComplete = useCallback(
    (winner: number | null) => {
      setLocalWinningNumber(winner);
      onSpinComplete();
    },
    [onSpinComplete]
  );

  useEffect(() => {
    if (gameState.state === 'spinning' && gameState.spinTime) {
      startSpinAnimation(gameState.winningNumber);
    } else if (gameState.state === 'revealing' && gameState.revealTime) {
      handleSpinComplete(gameState.winningNumber);
    } else if (
      gameState.state === 'settled' &&
      gameState.winningNumber !== null
    ) {
      setLocalWinningNumber(gameState.winningNumber);
      const timer = setTimeout(() => {
        setLocalWinningNumber(null);
      }, 5000);
      return () => clearTimeout(timer);
    }

    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, [
    gameState.state,
    gameState.spinTime,
    gameState.revealTime,
    gameState.winningNumber,
    startSpinAnimation,
    handleSpinComplete,
  ]);

  const placeChip = (number: number) => {
    if (isSpinning || !playerWallet) return;

    placeBet({
      id: `bet-${Date.now()}`,
      label: `Straight ${number}`,
      numbers: [number],
      amount: betAmount,
      type: 'straight',
      payout: 35,
    });
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return 'bg-green-600';
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-gray-900';
  };

  const placeBet = async (bet: Omit<Bet, 'player'>) => {
    if (gameState.state !== 'open' || bet.amount > userBalance) return;

    try {
      if (onPlaceBet) {
        await onPlaceBet(bet);
        setBets(prev => [...prev, bet]);
        setCurrentPot(prev => prev + bet.amount);
        setUserBalance(prev => prev - bet.amount);
      }
    } catch (error) {
      // Failed to place bet - error handled by parent component
    }
  };

  const clearBets = () => {
    if (gameState.state !== 'open') return;

    const totalRefund = bets.reduce((sum, bet) => sum + bet.amount, 0);
    setUserBalance(prev => prev + totalRefund);
    setBets([]);
    setCurrentPot(0);
  };

  return (
    <div className='flex flex-col h-full bg-gray-50'>
      {/* Roulette Wheel Container */}
      <div className='flex-[2] flex items-center justify-center px-4 py-6'>
        <div className='relative w-[400px] h-[400px]'>
          {/* Outer Rim */}
          <div className='w-full h-full rounded-full bg-gradient-to-br from-amber-600 to-amber-800 p-4 shadow-2xl'>
            {/* Wheel */}
            <div
              ref={wheelRef}
              className='w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-white relative shadow-inner overflow-visible'
              style={{ transformOrigin: '50% 50%' }}
            >
              {/* Numbers around the wheel */}
              {ROULETTE_NUMBERS.map((number, index) => {
                const angle = (index / ROULETTE_NUMBERS.length) * 360;
                const radius = 130; // 130px radius for 400px wheel
                const x = Math.cos(((angle - 90) * Math.PI) / 180) * radius;
                const y = Math.sin(((angle - 90) * Math.PI) / 180) * radius;
                const isWinner = localWinningNumber === number;

                return (
                  <div
                    key={number}
                    className={`absolute w-7 h-7 flex items-center justify-center text-white text-xs font-bold rounded-sm ${getNumberColor(number)} ${isWinner ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                    style={{
                      left: `calc(50% + ${x}px - 14px)`,
                      top: `calc(50% + ${y}px - 14px)`,
                      transform: `rotate(${angle}deg)`,
                    }}
                  >
                    <span style={{ transform: `rotate(-${angle}deg)` }}>
                      {number}
                    </span>
                  </div>
                );
              })}

              {/* Ball Track */}
              <div className='absolute inset-6 rounded-full border-2 border-amber-700 border-opacity-30'></div>

              {/* Center Hub */}
              <div className='absolute top-1/2 left-1/2 w-10 h-10 -ml-5 -mt-5 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg flex items-center justify-center'>
                <div className='w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-800'></div>
              </div>
            </div>
          </div>

          {/* Ball */}
          <div
            ref={ballRef}
            className='absolute w-3 h-3 pointer-events-none'
            style={{
              left: 'calc(50% + 130px - 6px)',
              top: 'calc(50% - 6px)',
              transformOrigin: '6px 6px',
            }}
          >
            <div className='w-3 h-3 rounded-full bg-white shadow-lg'></div>
          </div>

          {/* Pointer */}
          <div className='absolute top-1 left-1/2 -ml-1.5 w-3 h-6 bg-gradient-to-b from-amber-600 to-amber-800 clip-triangle'></div>
        </div>
      </div>

      {/* Simple Betting Interface */}
      <div className='flex-shrink-0 bg-white border-t border-gray-200 p-4'>
        <div className='flex items-center justify-between gap-4'>
          <div className='text-sm'>
            <span className='text-gray-500'>Balance:</span>
            <span className='ml-2 font-mono font-semibold'>${userBalance}</span>
          </div>
          {gameState.state === 'open' && (
            <div className='flex justify-between items-center mt-6'>
              <div className='text-sm text-gray-600'>
                Balance:{' '}
                <span className='font-medium'>${userBalance.toFixed(2)}</span>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={clearBets}
                  disabled={bets.length === 0 || isSpinning}
                  className='px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 rounded font-medium'
                >
                  Clear ({bets.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Winning Announcement */}
      <AnimatePresence>
        {localWinningNumber !== null && (
          <motion.div
            className='absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className='bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center'
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <p className='text-sm text-gray-500 uppercase tracking-wider mb-2'>
                WINNING NUMBER
              </p>
              <div className='text-6xl font-light text-gray-900 mb-2'>
                {localWinningNumber}
              </div>
              <p className='text-lg text-gray-600'>
                {localWinningNumber === 0
                  ? 'GREEN'
                  : RED_NUMBERS.includes(localWinningNumber)
                    ? 'RED'
                    : 'BLACK'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
