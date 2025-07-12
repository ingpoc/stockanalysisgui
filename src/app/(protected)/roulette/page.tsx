'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuthNavigation } from '@/lib/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { RouletteGameWrapper } from '@/components/roulette/roulette-game-wrapper';
import { useRoulette } from '@/hooks/useRoulette';
import {
  isRouletteStateEqual,
  getRouletteStateDisplayName,
} from '@/types/roulette_types';
import { toast } from 'sonner';
import { BetType } from '@/types/generated/enhanced-types';
import { useStaggeredFadeIn, useCountUp } from '@/hooks/useGSAP';

export default function RoulettePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeGame, setActiveGame] = useState<any>(null);
  const [gameCountdown, setGameCountdown] = useState<{
    betting: number;
    spin: number;
    reveal: number;
  } | null>(null);
  const [selectedChipValue, setSelectedChipValue] = useState(10); // Default 10 USDC (10,000,000 lamports)

  const { connected, publicKey } = useWallet();
  const navigation = useAuthNavigation();

  const { 
    roulettes, 
    isLoading, 
    error, 
    isInitialized, 
    placeBet, 
    isPlacingBet, 
    processAutomation, 
    isProcessingAutomation 
  } = useRoulette();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted && !connected) {
      navigation.toLogin('/roulette');
    }
  }, [connected, navigation, isMounted]);

  // Animation refs
  const statsRef = useStaggeredFadeIn('.roulette-stat-item', 0.4);

  // Calculate real stats from blockchain data
  const activeGamesCount = Array.isArray(roulettes)
    ? roulettes.filter(game => {
        const state = game.state;
        const stateKey =
          typeof state === 'object' ? Object.keys(state)[0] : state;
        const now = Date.now() / 1000;
        const endTime = game.endTime || 0;
        const isActiveState = [
          'open',
          'locked',
          'spinning',
          'awaitingRandomness',
        ].includes(stateKey?.toLowerCase() || '');
        return isActiveState && endTime > now;
      }).length
    : 0;

  const totalPlayersCount = Array.isArray(roulettes)
    ? roulettes.reduce((sum, game) => sum + (game.totalPlayers || 0), 0)
    : 0;
  const totalPotAmount = Array.isArray(roulettes)
    ? roulettes.reduce(
        (sum, game) => sum + (game.totalBetAmount || 0) / 1_000_000,
        0
      )
    : 0;
  const totalCommission = Array.isArray(roulettes)
    ? roulettes.reduce(
        (sum, game) => sum + (game.treasuryFeeCollected || 0) / 1_000_000,
        0
      )
    : 0;

  // Animated counters
  const gamesRef = useCountUp(activeGamesCount, '', '', 1);
  const playersRef = useCountUp(totalPlayersCount, '', '', 1.2);
  const potRef = useCountUp(totalPotAmount, '$', '', 1.4);
  const commissionRef = useCountUp(totalCommission, '$', '', 1.6);

  // The program handles automation continuously, no client-side automation needed
  // Just display the current state

  // Update active game from roulettes list - handle multiple games gracefully
  useEffect(() => {
    if (Array.isArray(roulettes) && roulettes.length > 0) {
      // Find active games (not completed, expired, or cancelled)
      const now = Date.now() / 1000;
      const activeGames = roulettes.filter(game => {
        const state = game.state;
        const stateKey =
          typeof state === 'object' ? Object.keys(state)[0] : state;
        const endTime = game.endTime || 0;

        // Debug logging for the most recent game
        if (game === roulettes[0]) {
        }

        const isActiveState = [
          'open',
          'locked',
          'spinning',
          'awaitingRandomness',
        ].includes(stateKey?.toLowerCase() || '');
        const isNotExpired = endTime > now;

        return isActiveState && isNotExpired;
      });

      if (activeGames.length > 0) {
        // If multiple active games exist, show the most recent one
        const mostRecentGame = activeGames.sort((a, b) => {
          const aCreated = a.createdAt || 0;
          const bCreated = b.createdAt || 0;
          return bCreated - aCreated; // Most recent first
        })[0];

        if (activeGames.length > 1) {
        }

        setActiveGame(mostRecentGame);
      } else {
        setActiveGame(null);
      }
    }
  }, [roulettes]);

  // Countdown timer for active game
  useEffect(() => {
    if (!activeGame) {
      setGameCountdown(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now() / 1000;
      const bettingEndTime = activeGame.bettingEndTime || 0;
      const spinTime = activeGame.spinTime || 0;
      const revealTime = activeGame.revealTime || 0;

      setGameCountdown({
        betting: Math.max(0, bettingEndTime - now),
        spin: Math.max(0, spinTime - now),
        reveal: Math.max(0, revealTime - now),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeGame]);

  if (!isMounted) {
    return null;
  }

  // Calculate real stats from blockchain data (legacy - not used with new stats grid)
  const activePlayers = Array.isArray(roulettes)
    ? roulettes.reduce((sum, roulette) => sum + (roulette.totalPlayers || 0), 0)
    : 0;
  const totalPot = Array.isArray(roulettes)
    ? roulettes.reduce(
        (sum, roulette) => sum + (roulette.totalBetAmount || 0) / 1_000_000,
        0
      )
    : 0;
  const lastWinner = Array.isArray(roulettes)
    ? roulettes.find(r => r.winningNumber !== null)?.winningNumber || null
    : null;
  const activeGames = Array.isArray(roulettes)
    ? roulettes.filter(
        r =>
          isRouletteStateEqual(r.state, 'open') ||
          isRouletteStateEqual(r.state, 'locked')
      ).length
    : 0;

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if betting is open
  const isBettingOpen =
    activeGame &&
    isRouletteStateEqual(activeGame.state, 'open') &&
    gameCountdown &&
    gameCountdown.betting > 0;

  // Chip values in USDC
  const CHIP_VALUES = [1, 5, 10, 25, 50, 100];

  // Handle placing bets
  const handlePlaceBet = async (betType: BetType, betNumbers: number[]) => {
    if (!activeGame || !isBettingOpen || !publicKey || !activeGame.publicKey) {
      toast.error('Cannot place bet at this time');
      return;
    }

    try {
      // Convert USDC to lamports (6 decimals)
      const betAmountLamports = selectedChipValue * 1_000_000;

      await placeBet({
        roulette: activeGame.publicKey, // Now using actual roulette account public key
        betType,
        betAmount: betAmountLamports,
        betNumbers,
      });

      toast.success(
        `Bet placed: $${selectedChipValue} on ${betNumbers.join(',')}`
      );
    } catch (error) {}
  };

  // Convert BetType enum for different bet types
  const createBetType = (type: string): BetType => {
    switch (type) {
      case 'straight':
        return BetType.Straight;
      case 'red':
        return BetType.Red;
      case 'black':
        return BetType.Black;
      case 'odd':
        return BetType.Odd;
      case 'even':
        return BetType.Even;
      case 'low':
        return BetType.Low;
      case 'high':
        return BetType.High;
      case 'firstTwelve':
        return BetType.FirstTwelve;
      case 'secondTwelve':
        return BetType.SecondTwelve;
      case 'thirdTwelve':
        return BetType.ThirdTwelve;
      default:
        return BetType.Straight;
    }
  };

  return (
    <PageContainer>
      {/* Pure Data Grid - Swiss Typography with Animations */}
      <div ref={statsRef} className='grid grid-cols-4 gap-16 mb-16'>
        <div className='roulette-stat-item'>
          <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
            ACTIVE
          </div>
          <div
            ref={gamesRef}
            className='text-3xl font-light text-gray-900 font-mono'
          >
            0
          </div>
        </div>
        <div className='roulette-stat-item'>
          <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
            PLAYERS
          </div>
          <div
            ref={playersRef}
            className='text-3xl font-light text-gray-900 font-mono'
          >
            0
          </div>
        </div>
        <div className='roulette-stat-item'>
          <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
            POT
          </div>
          <div
            ref={potRef}
            className='text-3xl font-light text-gray-900 font-mono'
          >
            $0.00
          </div>
        </div>
        <div className='roulette-stat-item'>
          <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
            COMMISSION
          </div>
          <div
            ref={commissionRef}
            className='text-3xl font-light text-gray-900 font-mono'
          >
            $0.00
          </div>
        </div>
      </div>

      {/* Program Status */}
      {isInitialized !== undefined && !isInitialized && (
        <div className='mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg'>
          <div className='text-sm'>
            <strong>Program Status:</strong> Not Initialized
            <span className='ml-2 text-orange-600'>
              → Contact admin to initialize the roulette program
            </span>
          </div>
        </div>
      )}

      {/* DEBUG: Manual Automation Trigger (Temporary) */}
      {activeGame && process.env.NODE_ENV === 'development' && (
        <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div className='text-sm'>
              <strong>🔧 DEBUG:</strong> Manual automation trigger for testing
              <div className='text-xs text-gray-600 mt-1'>
                Game: {activeGame.publicKey?.slice(0, 8)}... | State: {getRouletteStateDisplayName(activeGame.state)}
              </div>
            </div>
            <button
              onClick={() => processAutomation()}
              disabled={isProcessingAutomation}
              className='px-4 py-2 text-xs text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 transition-colors duration-200 uppercase tracking-wider disabled:opacity-50'
            >
              {isProcessingAutomation ? 'PROCESSING...' : 'TRIGGER AUTOMATION'}
            </button>
          </div>
        </div>
      )}

      {/* Current Active Game - Main Focus */}
      {activeGame ? (
        <div className='mb-16'>
          <div className='text-center mb-8'>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
              LIVE GAME
            </div>
            <div className='text-4xl font-light text-gray-900 mb-2'>
              European Roulette
            </div>
            <div
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                isRouletteStateEqual(activeGame.state, 'open')
                  ? 'bg-green-100 text-green-800'
                  : isRouletteStateEqual(activeGame.state, 'locked')
                    ? 'bg-yellow-100 text-yellow-800'
                    : isRouletteStateEqual(activeGame.state, 'spinning')
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
              }`}
            >
              {getRouletteStateDisplayName(activeGame.state)}
            </div>
          </div>

          {/* Game Statistics Grid */}
          <div className='grid grid-cols-4 gap-16 mb-12'>
            <div>
              <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                PLAYERS
              </div>
              <div className='text-3xl font-light text-gray-900 font-mono'>
                {activeGame.totalPlayers || 0}
              </div>
            </div>
            <div>
              <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                POT SIZE
              </div>
              <div className='text-3xl font-light text-gray-900 font-mono'>
                ${((activeGame.totalBetAmount || 0) / 1_000_000).toFixed(2)}
              </div>
            </div>
            <div>
              <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                BET RANGE
              </div>
              <div className='text-3xl font-light text-gray-900 font-mono'>
                ${((activeGame.minBet || 0) / 1_000_000).toFixed(0)}-$
                {((activeGame.maxBet || 0) / 1_000_000).toFixed(0)}
              </div>
            </div>
            <div>
              <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                {activeGame.winningNumber !== null
                  ? 'WINNING NUMBER'
                  : 'TOTAL BETS'}
              </div>
              <div className='text-3xl font-light text-gray-900 font-mono'>
                {activeGame.winningNumber !== null
                  ? activeGame.winningNumber
                  : activeGame.totalBets || 0}
              </div>
            </div>
          </div>

          {/* Game Timing - Prominent Display */}
          {gameCountdown && (
            <div className='bg-white border border-gray-200 rounded-lg p-8 mb-12'>
              <div className='grid grid-cols-3 gap-8 text-center'>
                <div>
                  <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                    BETTING CLOSES IN
                  </div>
                  <div className='text-4xl font-light text-gray-900 font-mono'>
                    {formatTimeRemaining(gameCountdown.betting)}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                    SPIN STARTS IN
                  </div>
                  <div className='text-4xl font-light text-gray-900 font-mono'>
                    {formatTimeRemaining(gameCountdown.spin)}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                    RESULTS IN
                  </div>
                  <div className='text-4xl font-light text-gray-900 font-mono'>
                    {formatTimeRemaining(gameCountdown.reveal)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Betting Status */}
          {activeGame &&
            isRouletteStateEqual(activeGame.state, 'open') &&
            gameCountdown &&
            gameCountdown.betting > 0 && (
              <div className='text-center mb-8'>
                <div className='inline-block px-6 py-3 bg-green-50 border border-green-200 rounded-lg'>
                  <div className='text-sm font-medium text-green-800'>
                    Betting is OPEN - Place your bets below
                  </div>
                </div>
              </div>
            )}
        </div>
      ) : (
        /* No Active Game State */
        <div className='text-center py-16'>
          <div className='text-gray-500 mb-4'>
            {isInitialized === false
              ? 'Program needs to be initialized first'
              : isLoading
                ? 'Loading current game...'
                : 'Preparing next roulette game...'}
          </div>
          <div className='text-xs text-gray-400 mt-2'>
            Games run continuously once initialized. Next game will appear
            automatically.
          </div>
        </div>
      )}

      {/* 3D Roulette Game - Keep existing for visual appeal */}
      <div className='h-[600px] mt-8'>
        <RouletteGameWrapper playerWallet={publicKey?.toBase58()} />
      </div>

      {/* Betting Interface - Only show when there's an active game */}
      {activeGame && (
        <div className='mt-12 mb-8'>
          <div className='text-center mb-8'>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
              PLACE YOUR BETS
            </div>
            <div
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                isBettingOpen
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isBettingOpen
                ? `Betting Open - ${formatTimeRemaining(gameCountdown?.betting || 0)} remaining`
                : 'Betting Closed'}
            </div>
          </div>

          {/* Chip Selection */}
          <div className='mb-8'>
            <div className='text-center mb-4'>
              <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                SELECT CHIP VALUE
              </div>
              <div className='flex justify-center gap-2'>
                {CHIP_VALUES.map(value => (
                  <button
                    key={value}
                    onClick={() => setSelectedChipValue(value)}
                    disabled={!isBettingOpen}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all
                      ${
                        selectedChipValue === value
                          ? 'bg-gray-900 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                      }
                      ${!isBettingOpen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    ${value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Betting Grid */}
          <div className='bg-white border border-gray-200 rounded-lg p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              {/* Number Betting */}
              <div>
                <h3 className='text-sm font-medium text-gray-500 uppercase tracking-wider mb-4'>
                  SINGLE NUMBERS (35:1)
                </h3>

                {/* Number Grid */}
                <div className='space-y-2'>
                  <div className='grid grid-cols-12 gap-1'>
                    {Array.from({ length: 36 }, (_, i) => {
                      const num = i + 1;
                      const isRed = [
                        1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30,
                        32, 34, 36,
                      ].includes(num);
                      return (
                        <button
                          key={num}
                          onClick={() =>
                            handlePlaceBet(createBetType('straight'), [num])
                          }
                          disabled={!isBettingOpen || isPlacingBet}
                          className={`
                            h-8 text-xs font-medium rounded transition-all
                            ${
                              isRed
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gray-800 hover:bg-gray-700 text-white'
                            }
                            ${!isBettingOpen || isPlacingBet ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                          `}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  {/* Zero */}
                  <button
                    onClick={() =>
                      handlePlaceBet(createBetType('straight'), [0])
                    }
                    disabled={!isBettingOpen || isPlacingBet}
                    className={`
                      w-full h-8 font-medium rounded bg-green-600 hover:bg-green-700 text-white transition-all
                      ${!isBettingOpen || isPlacingBet ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    0
                  </button>
                </div>
              </div>

              {/* Outside Bets */}
              <div>
                <h3 className='text-sm font-medium text-gray-500 uppercase tracking-wider mb-4'>
                  OUTSIDE BETS
                </h3>

                <div className='space-y-3'>
                  {/* Red/Black */}
                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      onClick={() =>
                        handlePlaceBet(
                          createBetType('red'),
                          [
                            1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27,
                            30, 32, 34, 36,
                          ]
                        )
                      }
                      disabled={!isBettingOpen || isPlacingBet}
                      className='py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-all disabled:opacity-50'
                    >
                      RED (1:1)
                    </button>
                    <button
                      onClick={() =>
                        handlePlaceBet(
                          createBetType('black'),
                          [
                            2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28,
                            29, 31, 33, 35,
                          ]
                        )
                      }
                      disabled={!isBettingOpen || isPlacingBet}
                      className='py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-all disabled:opacity-50'
                    >
                      BLACK (1:1)
                    </button>
                  </div>

                  {/* Odd/Even */}
                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      onClick={() =>
                        handlePlaceBet(
                          createBetType('odd'),
                          [
                            1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27,
                            29, 31, 33, 35,
                          ]
                        )
                      }
                      disabled={!isBettingOpen || isPlacingBet}
                      className='py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded transition-all disabled:opacity-50'
                    >
                      ODD (1:1)
                    </button>
                    <button
                      onClick={() =>
                        handlePlaceBet(
                          createBetType('even'),
                          [
                            2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28,
                            30, 32, 34, 36,
                          ]
                        )
                      }
                      disabled={!isBettingOpen || isPlacingBet}
                      className='py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded transition-all disabled:opacity-50'
                    >
                      EVEN (1:1)
                    </button>
                  </div>

                  {/* Low/High */}
                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      onClick={() =>
                        handlePlaceBet(
                          createBetType('low'),
                          Array.from({ length: 18 }, (_, i) => i + 1)
                        )
                      }
                      disabled={!isBettingOpen || isPlacingBet}
                      className='py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded transition-all disabled:opacity-50'
                    >
                      1-18 (1:1)
                    </button>
                    <button
                      onClick={() =>
                        handlePlaceBet(
                          createBetType('high'),
                          Array.from({ length: 18 }, (_, i) => i + 19)
                        )
                      }
                      disabled={!isBettingOpen || isPlacingBet}
                      className='py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded transition-all disabled:opacity-50'
                    >
                      19-36 (1:1)
                    </button>
                  </div>

                  {/* Dozens */}
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wider mb-2'>
                      DOZENS (2:1)
                    </p>
                    <div className='grid grid-cols-3 gap-2'>
                      <button
                        onClick={() =>
                          handlePlaceBet(
                            createBetType('firstTwelve'),
                            Array.from({ length: 12 }, (_, i) => i + 1)
                          )
                        }
                        disabled={!isBettingOpen || isPlacingBet}
                        className='py-2 px-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded transition-all disabled:opacity-50'
                      >
                        1ST
                      </button>
                      <button
                        onClick={() =>
                          handlePlaceBet(
                            createBetType('secondTwelve'),
                            Array.from({ length: 12 }, (_, i) => i + 13)
                          )
                        }
                        disabled={!isBettingOpen || isPlacingBet}
                        className='py-2 px-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded transition-all disabled:opacity-50'
                      >
                        2ND
                      </button>
                      <button
                        onClick={() =>
                          handlePlaceBet(
                            createBetType('thirdTwelve'),
                            Array.from({ length: 12 }, (_, i) => i + 25)
                          )
                        }
                        disabled={!isBettingOpen || isPlacingBet}
                        className='py-2 px-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded transition-all disabled:opacity-50'
                      >
                        3RD
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Betting Status */}
            {!isBettingOpen && activeGame && (
              <div className='mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-center'>
                <div className='text-sm text-orange-800'>
                  Betting is closed.
                  {isRouletteStateEqual(activeGame.state, 'locked') &&
                    ' Game is locked for spinning.'}
                  {isRouletteStateEqual(activeGame.state, 'spinning') &&
                    ' Wheel is spinning...'}
                  {isRouletteStateEqual(
                    activeGame.state,
                    'awaitingRandomness'
                  ) && ' Awaiting results...'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
