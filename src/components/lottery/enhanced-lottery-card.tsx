'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { LotteryType, LotteryState, LotteryInfo } from '@/types/lottery_types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Ticket, Trophy, Loader2, Clock, Target } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { handleProgramError, formatUSDC, cn } from '@/lib/utils'
import { AdminLotteryControls } from './admin-lottery-controls'
import { ADMIN_WALLET } from '@/lib/constants'
import { useLottery } from '@/hooks/useLottery'
import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'

interface LotteryCardProps {
  lottery: LotteryInfo
  onParticipate: () => void
}

export function EnhancedLotteryCard({ lottery, onParticipate }: LotteryCardProps) {
  const { publicKey } = useWallet()
  
  const {
    buyTicket,
    isBuying
  } = useLottery()

  const isActive = lottery.state === 'Open'
  const drawDate = new Date(lottery.drawTime * 1000)
  const isEnded = drawDate < new Date()
  const isAdmin = publicKey?.toBase58() === ADMIN_WALLET
  const isLotteryAuthority = publicKey?.toBase58() === lottery.createdBy

  const formatUSDCValue = (value: number): string => {
    return formatUSDC(value);
  }

  const handleBuyTickets = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet to buy tickets')
      return
    }

    try {
      await buyTicket({ 
        lotteryAddress: lottery.address
      })
      onParticipate()
    } catch (error) {
      console.error('Failed to buy ticket (UI): ', error)
    } 
  }
  
  // Pure minimalism - "Less but Better" (Dieter Rams)
  // Only essential differences, maximum restraint
  const getLotteryIndicator = (type: string) => {
    // Single subtle indicator only - no colors, just position
    switch (type) {
      case 'Daily': return '●'
      case 'Weekly': return '■'  
      case 'Monthly': return '▲'
      default: return '○'
    }
  }
  
  const cardRef = useRef<HTMLDivElement>(null)
  const prizeRef = useRef<HTMLDivElement>(null)
  const ticketsRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const progressPercentage = lottery.targetPrizePool && lottery.targetPrizePool > 0 
    ? Math.min(100, (lottery.prizePool / lottery.targetPrizePool) * 100)
    : 0

  // Rolling number animation for prize pool
  const animateNumberRoll = useCallback((element: HTMLElement, newValue: number, formatter: (val: number) => string) => {
    const startValue = parseFloat(element.textContent?.replace(/[^0-9.]/g, '') || '0')
    const obj = { value: startValue }
    
    gsap.to(obj, {
      value: newValue,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = formatter(obj.value)
      }
    })
  }, [])

  // Subtle GSAP animations on mount
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
    }
  }, [])

  // Animate prize pool changes
  useEffect(() => {
    if (prizeRef.current && lottery.prizePool > 0) {
      animateNumberRoll(prizeRef.current, lottery.prizePool, formatUSDCValue)
    }
  }, [lottery.prizePool, animateNumberRoll])

  // Animate ticket count changes
  useEffect(() => {
    if (ticketsRef.current && lottery.totalTickets > 0) {
      animateNumberRoll(ticketsRef.current, lottery.totalTickets, (val) => Math.floor(val).toString())
    }
  }, [lottery.totalTickets, animateNumberRoll])

  // Hover interactions
  const handleCardHover = useCallback((isHovering: boolean) => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: isHovering ? 1.01 : 1,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }, [])

  const handleButtonHover = useCallback((isHovering: boolean) => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: isHovering ? 1.02 : 1,
        duration: 0.2,
        ease: "power2.out"
      })
    }
  }, [])

  // State transition animations
  useEffect(() => {
    if (progressRef.current && lottery.targetPrizePool && lottery.targetPrizePool > 0) {
      gsap.to(progressRef.current, {
        scaleX: progressPercentage / 100,
        duration: 0.8,
        ease: "power2.out",
        transformOrigin: "left center"
      })
    }
  }, [progressPercentage])

  return (
    <div 
      ref={cardRef}
      className="bg-white border border-gray-200 hover:border-gray-300 transition-colors duration-200"
      onMouseEnter={() => handleCardHover(true)}
      onMouseLeave={() => handleCardHover(false)}
    >
      {/* Swiss Grid System Header - Pure Typography */}
      <div className="p-6 pb-0">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">{getLotteryIndicator(lottery.lotteryType)}</span>
            <h3 className="text-base font-normal text-gray-900 tracking-wide">
              {lottery.lotteryType.toUpperCase()}
            </h3>
          </div>
          <span className={`text-xs tracking-wider ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
            {lottery.state.toUpperCase()}
          </span>
        </div>
        
        {/* Date - Helvetica-inspired clean typography */}
        <p className="text-xs text-gray-500 mt-2 font-mono">
          {format(drawDate, 'dd.MM.yyyy HH:mm')}
        </p>
      </div>
      
      {/* Swiss Grid Content - Maximum Information Density, Minimum Visual Noise */}
      <div className="px-6 py-6">
        {/* Essential Data Only - Typography as Interface */}
        <div className="space-y-4">
          
          {/* Price/Prize Grid - Functional Layout */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">PRICE</div>
              <div className="text-xl font-light text-gray-900 font-mono">
                {formatUSDCValue(lottery.ticketPrice)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">PRIZE</div>
              <div ref={prizeRef} className="text-xl font-light text-gray-900 font-mono">
                {formatUSDCValue(lottery.prizePool)}
              </div>
            </div>
          </div>

          {/* Essential Metrics - No Decorative Elements */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-400 uppercase tracking-wider">TICKETS</span>
              <span ref={ticketsRef} className="text-sm font-mono text-gray-900">{lottery.totalTickets}</span>
            </div>
            
            {lottery.targetPrizePool && lottery.targetPrizePool > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-400 uppercase tracking-wider">PROGRESS</span>
                <span className="text-sm font-mono text-gray-900">{Math.round(progressPercentage)}%</span>
              </div>
            )}
            
            {/* Minimal progress indicator */}
            {lottery.targetPrizePool && lottery.targetPrizePool > 0 && (
              <div className="w-full h-px bg-gray-200 overflow-hidden">
                <div 
                  ref={progressRef}
                  className="h-full bg-gray-900 origin-left"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
            )}
            
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                {isActive ? 'DRAW' : 'ENDED'}
              </span>
              <span className="text-xs font-mono text-gray-600">
                {(() => {
                  const drawDate = new Date(lottery.drawTime * 1000);
                  const now = new Date();
                  const timeDiff = drawDate.getTime() - now.getTime();
                  
                  if (timeDiff > 0) {
                    // Future - show "in X time"
                    return formatDistanceToNow(drawDate, { addSuffix: true });
                  } else {
                    // Past - show "X time ago"
                    return formatDistanceToNow(drawDate, { addSuffix: true });
                  }
                })()}
              </span>
            </div>
          </div>

          {/* Winner State - Only When Necessary */}
          {lottery.winningNumbers && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-400 uppercase tracking-wider">WINNER</span>
                <span className="text-xs font-mono text-gray-900">
                  {lottery.createdBy.slice(0, 12)}...
                </span>
              </div>
            </div>
          )}
          
          {/* Admin Only - When Required */}
          {(isAdmin || isLotteryAuthority) && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                {isAdmin ? 'ADMIN' : 'AUTHORITY'}
              </div>
              <AdminLotteryControls 
                lottery={lottery} 
                onStateChange={onParticipate} 
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Single Action - Pure Function */}
      <div className="px-6 pb-6">
        {isActive && !isEnded && publicKey ? (
          <button 
            ref={buttonRef}
            className="w-full py-3 text-sm text-gray-900 border border-gray-300 hover:border-gray-900 hover:text-gray-900 transition-colors duration-200 font-mono tracking-wide"
            onClick={handleBuyTickets}
            onMouseEnter={() => handleButtonHover(true)}
            onMouseLeave={() => handleButtonHover(false)}
            disabled={isBuying}
          >
            {isBuying ? 'PROCESSING...' : `BUY • ${formatUSDCValue(lottery.ticketPrice)}`}
          </button>
        ) : (
          <div className="text-center py-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              {!publicKey ? 'WALLET REQUIRED' : 
               !isActive ? 'UNAVAILABLE' : 
               'DRAW ENDED'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
} 