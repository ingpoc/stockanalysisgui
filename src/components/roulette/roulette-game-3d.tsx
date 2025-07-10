import { useEffect, useState } from 'react';
import { useRoulette } from '@/hooks/useRoulette';
import { useConnection } from '@solana/wallet-adapter-react';
import { SimpleRouletteWheel } from './simple-roulette-wheel';
import type { Bet, BetType } from './simple-roulette-wheel';

export interface RouletteGame3DProps {
  playerWallet?: string;
  onPlaceBet?: (bet: Omit<Bet, 'player'>) => Promise<void>;
}

interface GameState {
  state: 'idle' | 'open' | 'locked' | 'spinning' | 'revealing' | 'settled';
  winningNumber: number | null;
  spinTime: number;
  revealTime: number;
  endTime?: number;
}

export function RouletteGame3D({
  playerWallet,
  onPlaceBet,
}: RouletteGame3DProps) {
  const { roulettes } = useRoulette();
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState>({
    state: 'idle',
    winningNumber: null,
    spinTime: 0,
    revealTime: 0,
  });

  useEffect(() => {
    if (!roulettes || roulettes.length === 0) return;

    const now = Date.now() / 1000;
    const activeGame = roulettes.find((game: any) => {
      return (
        game.state === 'open' ||
        game.state === 'locked' ||
        game.state === 'spinning' ||
        (game.endTime && game.endTime > now)
      );
    });

    if (activeGame) {
      setCurrentGame(activeGame);

      // Convert BN to number if needed
      const toNumber = (value: any): number => {
        return typeof value?.toNumber === 'function'
          ? value.toNumber()
          : value || 0;
      };

      // Ensure we're working with a plain object and not a class instance
      const gameStateValue =
        typeof activeGame.state === 'object' && activeGame.state !== null
          ? activeGame.state
          : { state: activeGame.state };

      const newGameState: GameState = {
        state:
          typeof gameStateValue.state === 'string'
            ? (gameStateValue.state as GameState['state'])
            : 'idle',
        winningNumber:
          activeGame.winningNumber !== undefined
            ? Number(activeGame.winningNumber)
            : null,
        spinTime: toNumber(activeGame.spinTime),
        revealTime: toNumber(activeGame.revealTime),
        endTime: toNumber(activeGame.endTime),
      };

      setGameState(prev => ({
        ...prev,
        ...newGameState,
        // Only update winning number if we have a new one
        winningNumber:
          newGameState.winningNumber !== null
            ? newGameState.winningNumber
            : prev.winningNumber,
      }));
    }
  }, [roulettes]);

  const handleSpinComplete = () => {
    // Spin complete, ready for next game
  };

  const handlePlaceBet = async (bet: Omit<Bet, 'player'>) => {
    if (gameState.state !== 'open' || !playerWallet || !onPlaceBet) return;

    try {
      // Create a new bet object with the player wallet
      const betWithPlayer: Bet = {
        ...bet,
        player: playerWallet,
      };
      await onPlaceBet(betWithPlayer);
    } catch (err) {
      throw err; // Re-throw to handle in the SimpleRouletteWheel component
    }
  };

  return (
    <div className='w-full h-full'>
      <SimpleRouletteWheel
        playerWallet={playerWallet}
        gameState={gameState}
        onPlaceBet={handlePlaceBet}
        onSpinComplete={handleSpinComplete}
        isSpinning={gameState.state === 'spinning'}
        winningNumber={gameState.winningNumber}
      />

      <div className='absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg'>
        <div className='text-sm'>
          Status:{' '}
          <span className='font-medium capitalize'>{gameState.state}</span>
        </div>
        {gameState.winningNumber !== null && (
          <div className='text-sm mt-1'>
            Last Number:{' '}
            <span className='font-medium'>{gameState.winningNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}
