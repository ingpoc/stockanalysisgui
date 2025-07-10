import { useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RouletteProgram } from '@/lib/solana/roulette-program';
import { RouletteType, BetType } from '@/types/enhanced-types';
import type {
  RouletteAccount as RuntimeRouletteAccount,
  RouletteDisplay,
} from '@/types/roulette-runtime-types';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from './useWallet';
import { PublicKey } from '@solana/web3.js';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { handleProgramError } from '@/lib/utils';

// Use RouletteDisplay from runtime types
type RouletteWithMetadata = RouletteDisplay;

export function useRoulette() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const queryClient = useQueryClient();

  const anchorWallet: AnchorWallet | undefined = useMemo(() => {
    return publicKey && signTransaction && signAllTransactions
      ? {
          publicKey: publicKey,
          signTransaction: signTransaction,
          signAllTransactions: signAllTransactions,
        }
      : undefined;
  }, [publicKey, signTransaction, signAllTransactions]);

  const program = useMemo(() => {
    return anchorWallet ? new RouletteProgram(connection, anchorWallet) : null;
  }, [connection, anchorWallet]);

  // Set up program event listeners using proper Solana WebSocket architecture
  useEffect(() => {
    if (!program || !connection) return;

    const subscriptionIds: number[] = [];
    const anchorEventListeners: number[] = [];

    const setupEventListeners = async () => {
      try {
        const programInstance = await (program as any).program;

        console.log(
          '🎰 [EVENT SETUP] Initializing event listeners for program:',
          programInstance.programId.toString()
        );

        // Method 1: Anchor addEventListener (for high-level events)
        try {
          // Listen to RouletteSpun events (winning number generated) - Most important
          const rouletteSpunListener = programInstance.addEventListener(
            'rouletteSpun',
            (event: any, slot: number) => {
              console.log('🎰 [ANCHOR EVENT] RouletteSpun |', {
                slot,
                rouletteId: event.rouletteId?.toString(),
                winningNumber: event.winningNumber?.toString(),
                totalWinners: event.totalWinners?.toString(),
                totalPayouts: event.totalPayouts?.toString(),
                houseEdgeCollected: event.houseEdgeCollected?.toString(),
                treasuryFeeCollected: event.treasuryFeeCollected?.toString(),
                timestamp: new Date(event.timestamp * 1000).toLocaleString(),
              });

              // Prominent winning number display
              console.log(
                `🎯 [WINNING NUMBER] ${event.winningNumber} | Game: ${event.rouletteId?.toString().slice(0, 8)}...`
              );
              console.warn(`🎯 WINNING NUMBER: ${event.winningNumber}`);

              // Trigger UI refresh
              queryClient.invalidateQueries({ queryKey: ['roulettes'] });
            }
          );
          anchorEventListeners.push(rouletteSpunListener);

          // Listen to BetPlaced events
          const betPlacedListener = programInstance.addEventListener(
            'betPlaced',
            (event: any, slot: number) => {
              console.log('🎰 [ANCHOR EVENT] BetPlaced |', {
                slot,
                rouletteId: event.rouletteId?.toString(),
                betId: event.betId?.toString(),
                bettor: event.bettor?.toString(),
                betType:
                  typeof event.betType === 'object'
                    ? Object.keys(event.betType)[0]
                    : event.betType,
                betAmount: event.betAmount?.toString(),
                totalBets: event.totalBets?.toString(),
                timestamp: new Date(event.timestamp * 1000).toLocaleString(),
              });

              // Trigger UI refresh for bet updates
              queryClient.invalidateQueries({ queryKey: ['roulettes'] });
            }
          );
          anchorEventListeners.push(betPlacedListener);

          // Listen to BettingLocked events
          const bettingLockedListener = programInstance.addEventListener(
            'bettingLocked',
            (event: any, slot: number) => {
              console.log('🎰 [ANCHOR EVENT] BettingLocked |', {
                slot,
                rouletteId: event.rouletteId?.toString(),
                totalBets: event.totalBets?.toString(),
                totalBetAmount: event.totalBetAmount?.toString(),
                totalPlayers: event.totalPlayers?.toString(),
                spinTime: new Date(event.spinTime * 1000).toLocaleString(),
                timestamp: new Date(event.timestamp * 1000).toLocaleString(),
              });

              // Trigger UI refresh for state change
              queryClient.invalidateQueries({ queryKey: ['roulettes'] });
            }
          );
          anchorEventListeners.push(bettingLockedListener);

          // Listen to RouletteCreated events
          const createdListener = programInstance.addEventListener(
            'rouletteCreated',
            (event: any, slot: number) => {
              console.log('🎰 [ANCHOR EVENT] RouletteCreated |', {
                slot,
                rouletteId: event.rouletteId?.toString(),
                creator: event.creator?.toString(),
                rouletteType:
                  typeof event.rouletteType === 'object'
                    ? Object.keys(event.rouletteType)[0]
                    : event.rouletteType,
                minBet: event.minBet?.toString(),
                maxBet: event.maxBet?.toString(),
                timestamp: new Date(event.timestamp * 1000).toLocaleString(),
              });

              // Trigger UI refresh for new game
              queryClient.invalidateQueries({ queryKey: ['roulettes'] });
            }
          );
          anchorEventListeners.push(createdListener);

          // Listen to RouletteStateChanged events (for auto-transitions)
          const stateChangedListener = programInstance.addEventListener(
            'rouletteStateChanged',
            (event: any, slot: number) => {
              console.log('🎰 [ANCHOR EVENT] RouletteStateChanged |', {
                slot,
                rouletteId: event.rouletteId?.toString(),
                oldState: event.oldState,
                newState: event.newState,
                timestamp: new Date(event.timestamp * 1000).toLocaleString(),
              });
              
              // Trigger UI refresh for state transitions
              queryClient.invalidateQueries({ queryKey: ['roulettes'] });
            }
          );
          anchorEventListeners.push(stateChangedListener);

          // Listen to RouletteSpinStarted events (for spin initiation)
          const spinStartedListener = programInstance.addEventListener(
            'rouletteSpinStarted',
            (event: any, slot: number) => {
              console.log('🎰 [ANCHOR EVENT] RouletteSpinStarted |', {
                slot,
                rouletteId: event.rouletteId?.toString(),
                vrfClient: event.vrfClient?.toString(),
                timestamp: new Date(event.timestamp * 1000).toLocaleString(),
              });
              
              // Trigger UI refresh for spin start
              queryClient.invalidateQueries({ queryKey: ['roulettes'] });
            }
          );
          anchorEventListeners.push(spinStartedListener);

          console.log(
            '🎰 [EVENT SETUP] Anchor event listeners registered:',
            anchorEventListeners.length
          );
        } catch (anchorError) {
          console.log(
            '🎰 [EVENT SETUP] Anchor addEventListener failed:',
            anchorError
          );
        }

        // Method 2: Direct WebSocket logs subscription (more reliable, captures all program activity)
        try {
          console.log(
            '🎰 [EVENT SETUP] Setting up direct WebSocket logs subscription...'
          );

          // Subscribe to all logs for our program using proper Solana WebSocket API
          const logSubscriptionId = connection.onLogs(
            programInstance.programId,
            (logs: any, context: any) => {
              console.log(
                '🎰 [WEBSOCKET EVENT] Program transaction detected:',
                {
                  slot: context.slot,
                  signature: logs.signature,
                  err: logs.err,
                  logCount: logs.logs.length,
                }
              );

              // Parse logs for program events and data
              logs.logs.forEach((log: string, index: number) => {
                // Check for Anchor events in logs
                if (log.includes('Program data:')) {
                  console.log('🎰 [WEBSOCKET EVENT] Program data detected:', {
                    index,
                    log: log.substring(0, 100) + '...', // Show first 100 chars
                    signature: logs.signature,
                  });

                  // Extract event data from Program data log
                  const dataMatch = log.match(/Program data: (.+)/);
                  if (dataMatch) {
                    try {
                      console.log(
                        '🎰 [WEBSOCKET EVENT] Raw event data:',
                        dataMatch[1]
                      );
                      // The program data contains base64 encoded event data
                      // Anchor events are automatically decoded by addEventListener
                      // This raw data serves as backup verification
                    } catch (parseError) {
                      console.log(
                        '🎰 [WEBSOCKET EVENT] Could not parse event data:',
                        parseError
                      );
                    }
                  }
                }

                // Check for specific program messages
                if (
                  log.includes('Auto-completed roulette:') ||
                  log.includes('winning number:')
                ) {
                  console.log(
                    '🎯 [WEBSOCKET EVENT] Winning number announcement detected:',
                    log
                  );
                  // Trigger immediate UI refresh when winning number is announced
                  setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ['roulettes'] });
                    queryClient.refetchQueries({ queryKey: ['roulettes'] });
                  }, 1000);
                }

                if (
                  log.includes('Auto-locked betting') ||
                  log.includes('Bet placed:')
                ) {
                  console.log(
                    '🎰 [WEBSOCKET EVENT] Game state change detected:',
                    log
                  );
                  // Trigger UI refresh for state changes
                  setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ['roulettes'] });
                  }, 500);
                }
              });
            },
            'confirmed' // Use confirmed commitment for faster updates
          );

          subscriptionIds.push(logSubscriptionId);
          console.log(
            '🎰 [EVENT SETUP] WebSocket logs subscription ID:',
            logSubscriptionId
          );
        } catch (wsError) {
          console.log(
            '🎰 [EVENT SETUP] WebSocket logs subscription failed:',
            wsError
          );
        }

        console.log(
          '🎰 [EVENT SETUP] Event monitoring active - Total subscriptions:',
          {
            anchorListeners: anchorEventListeners.length,
            wsSubscriptions: subscriptionIds.length,
          }
        );
      } catch (error) {
        console.log('🎰 [EVENT SETUP] Setup failed:', error);
      }
    };

    setupEventListeners();

    // Cleanup function
    return () => {
      console.log('🎰 [EVENT CLEANUP] Removing event listeners...');

      // Remove Anchor event listeners
      anchorEventListeners.forEach(listenerId => {
        try {
          // Note: Anchor doesn't provide a direct removeEventListener method
          // Event listeners are automatically cleaned up when component unmounts
        } catch (error) {
          console.log(
            '🎰 [EVENT CLEANUP] Error removing anchor listener:',
            error
          );
        }
      });

      // Remove WebSocket subscriptions
      subscriptionIds.forEach(subscriptionId => {
        try {
          connection.removeOnLogsListener(subscriptionId);
          console.log(
            '🎰 [EVENT CLEANUP] Removed WebSocket subscription:',
            subscriptionId
          );
        } catch (error) {
          console.log(
            '🎰 [EVENT CLEANUP] Error removing WebSocket subscription:',
            error
          );
        }
      });
    };
  }, [program, connection, queryClient]);

  // Check if program is initialized
  const { data: isInitialized } = useQuery({
    queryKey: ['roulette-initialized', publicKey],
    queryFn: async () => {
      if (!program) return false;
      return program.isInitialized();
    },
    enabled: !!program,
    staleTime: 60000, // Cache for 1 minute
  });

  // Get all roulette games
  const {
    data: roulettes,
    isLoading,
    error,
  } = useQuery<RouletteDisplay[], Error>({
    queryKey: ['roulettes', publicKey, isInitialized],
    queryFn: async () => {
      if (!program) throw new Error('Wallet not connected');
      if (!isInitialized) {
        return [];
      }

      try {
        const accounts = await program.getAllRouletteAccounts();

        // Filter for only active games (not completed, expired, or cancelled)
        const now = Date.now() / 1000;
        const activeAccounts = accounts.filter(item => {
          const account = item.account as any;
          const state = account.state;
          const endTime = account.endTime?.toNumber() || 0;

          // Get state string for program event logging
          const stateKey =
            typeof state === 'object' ? Object.keys(state)[0] : state;

          // Active states: Open, Locked, Spinning, AwaitingRandomness
          const activeStates = [
            'open',
            'locked',
            'spinning',
            'awaitingRandomness',
          ];
          const isActiveState = activeStates.includes(
            stateKey?.toLowerCase() || ''
          );
          const isNotExpired = endTime > now;

          const isActive = isActiveState && isNotExpired;

          // Log program events for state transitions
          if (isActive) {
            console.log(
              `🎰 [PROGRAM EVENT] Active Game: ${item.publicKey.toBase58().slice(0, 8)}... | State: ${stateKey.toUpperCase()} | EndTime: ${new Date(endTime * 1000).toLocaleString()}`
            );
          }

          return isActive;
        });

        // Log program event for game count
        if (activeAccounts.length > 0) {
          console.log(
            `🎰 [PROGRAM EVENT] Active Games Count: ${activeAccounts.length}`
          );
        }

        // Map accounts to include public key and convert BN values to numbers
        return activeAccounts.map((item): RouletteDisplay => {
          const account = item.account as any; // Runtime type is camelCase despite IDL showing snake_case
          return {
            publicKey: item.publicKey.toBase58(),
            rouletteType: account.rouletteType,
            minBet: account.minBet?.toNumber() || 0,
            maxBet: account.maxBet?.toNumber() || 0,
            gameDuration: account.gameDuration?.toNumber() || 0,
            bettingDuration: account.bettingDuration?.toNumber() || 0,
            startTime: account.startTime?.toNumber() || 0,
            bettingEndTime: account.bettingEndTime?.toNumber() || 0,
            spinTime: account.spinTime?.toNumber() || 0,
            revealTime: account.revealTime?.toNumber() || 0,
            endTime: account.endTime?.toNumber() || 0,
            state: account.state,
            totalBets: account.totalBets?.toNumber() || 0,
            totalBetAmount: account.totalBetAmount?.toNumber() || 0,
            totalPlayers: account.totalPlayers?.toNumber() || 0,
            winningNumber: account.winningNumber,
            lastBetId: account.lastBetId?.toNumber() || 0,
            createdBy:
              account.createdBy?.toBase58?.() ||
              account.createdBy?.toString() ||
              '',
            authority:
              account.authority?.toBase58?.() ||
              account.authority?.toString() ||
              '',
            globalConfig:
              account.globalConfig?.toBase58?.() ||
              account.globalConfig?.toString() ||
              '',
            vrfClient:
              account.vrfClient?.toBase58?.() ||
              account.vrfClient?.toString() ||
              null,
            vrfRandomness: account.vrfRandomness,
            vrfRequestKey:
              account.vrfRequestKey?.toBase58?.() ||
              account.vrfRequestKey?.toString() ||
              null,
            randomnessFulfilled: account.randomnessFulfilled || false,
            totalPayouts: account.totalPayouts?.toNumber() || 0,
            houseEdgeCollected: account.houseEdgeCollected?.toNumber() || 0,
            treasuryFeeCollected: account.treasuryFeeCollected?.toNumber() || 0,
            isSettled: account.isSettled || false,
            createdAt: account.createdAt?.toNumber() || 0,
            completedAt: account.completedAt?.toNumber() || null,
            nonce: account.nonce?.toNumber() || 0,
            bump: account.bump || 0,
          };
        });
      } catch (error) {
        throw error;
      }
    },
    enabled: !!program && isInitialized !== false,
    staleTime: 30000,
    retry: 1,
  });

  // Polling fallback for active games
  useEffect(() => {
    if (!roulettes) return;

    // Check if there are any active games that need polling
    const hasActiveGames = roulettes.some(game => {
      const state = game.state;
      const stateKey = typeof state === 'object' ? Object.keys(state)[0] : state;
      return ['open', 'locked', 'spinning', 'awaitingRandomness'].includes(stateKey?.toLowerCase());
    });

    if (!hasActiveGames) return;

    console.log('🎰 [POLLING] Starting polling for active games...');
    
    // Poll every 5 seconds during active games
    const pollingInterval = setInterval(() => {
      console.log('🎰 [POLLING] Refreshing roulette data...');
      queryClient.invalidateQueries({ queryKey: ['roulettes'] });
    }, 5000);

    return () => {
      console.log('🎰 [POLLING] Stopping polling for active games...');
      clearInterval(pollingInterval);
    };
  }, [roulettes, queryClient]);

  // Initialize roulette program (admin only)
  const initialize = useMutation({
    mutationFn: () => {
      if (!program) throw new Error('Wallet not connected');
      return program.initialize();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roulettes'] });
      toast.success('Roulette program initialized successfully!');
    },
    onError: error => {
      const errorMessage = handleProgramError(error);
      toast.error('Roulette initialization failed', {
        description: errorMessage,
      });
    },
  });

  // Create new roulette game
  const createRoulette = useMutation({
    mutationFn: ({
      rouletteType,
      minBet,
      maxBet,
      gameDuration,
      nonce,
    }: {
      rouletteType: RouletteType;
      minBet: number;
      maxBet: number;
      gameDuration: number;
      nonce: number;
    }) => {
      if (!program) throw new Error('Wallet not connected');

      // Client-side validation
      if (minBet <= 0) {
        throw new Error('Minimum bet must be greater than 0');
      }
      if (maxBet <= minBet) {
        throw new Error('Maximum bet must be greater than minimum bet');
      }
      if (gameDuration <= 0) {
        throw new Error('Game duration must be greater than 0');
      }

      return program.createRoulette(
        rouletteType,
        minBet,
        maxBet,
        gameDuration,
        nonce
      );
    },
    onSuccess: async () => {
      // Log program event for game creation
      console.log(
        '🎰 [PROGRAM EVENT] Game Created Successfully | Type: Roulette | Source: CreateRoulette'
      );

      // Force refetch with a small delay to ensure blockchain confirmation
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['roulettes'] });
        queryClient.refetchQueries({ queryKey: ['roulettes'] });
      }, 1000);
      toast.success('Roulette game created successfully!');
    },
    onError: error => {
      const errorMessage = handleProgramError(error);
      toast.error('Roulette creation failed', { description: errorMessage });
    },
  });

  // Create next game (for automation)
  const createNextGame = useMutation({
    mutationFn: (nonce: number) => {
      if (!program) throw new Error('Wallet not connected');
      return program.createNextGame(nonce);
    },
    onSuccess: async () => {
      // Log program event for automated game creation
      console.log(
        '🎰 [PROGRAM EVENT] Game Created Successfully | Type: Roulette | Source: CreateNextGame (Automation)'
      );

      // Force refetch with a small delay to ensure blockchain confirmation
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['roulettes'] });
        queryClient.refetchQueries({ queryKey: ['roulettes'] });
      }, 1000);
      toast.success('Next roulette game created successfully!');
    },
    onError: error => {
      const errorMessage = handleProgramError(error);
      toast.error('Next game creation failed', { description: errorMessage });
    },
  });

  // Place a bet
  const placeBet = useMutation({
    mutationFn: ({
      roulette,
      betType,
      betAmount,
      betNumbers,
    }: {
      roulette: string;
      betType: BetType;
      betAmount: number;
      betNumbers: number[];
    }) => {
      if (!program) throw new Error('Wallet not connected');

      // Client-side validation
      if (betAmount <= 0) {
        throw new Error('Bet amount must be greater than 0');
      }

      const roulettePubkey = new PublicKey(roulette);
      return program.placeBet(roulettePubkey, betType, betAmount, betNumbers);
    },
    onSuccess: () => {
      // Log program event for bet placement
      console.log(
        '🎰 [PROGRAM EVENT] Bet Placed Successfully | Action: PlaceBet'
      );

      queryClient.invalidateQueries({ queryKey: ['roulettes'] });
      toast.success('Bet placed successfully!');
    },
    onError: error => {
      const errorMessage = handleProgramError(error);
      toast.error('Bet placement failed', { description: errorMessage });
    },
  });

  // Lock betting
  const lockBetting = useMutation({
    mutationFn: ({ roulette }: { roulette: string }) => {
      if (!program) throw new Error('Wallet not connected');
      const roulettePubkey = new PublicKey(roulette);
      return program.lockBetting(roulettePubkey);
    },
    onSuccess: () => {
      // Log program event for betting lock
      console.log(
        '🎰 [PROGRAM EVENT] State Transition | From: OPEN | To: LOCKED | Action: LockBetting'
      );

      queryClient.invalidateQueries({ queryKey: ['roulettes'] });
      toast.success('Betting locked successfully!');
    },
    onError: error => {
      const errorMessage = handleProgramError(error);
      toast.error('Lock betting failed', { description: errorMessage });
    },
  });

  // Spin roulette
  const spinRoulette = useMutation({
    mutationFn: ({ roulette }: { roulette: string }) => {
      if (!program) throw new Error('Wallet not connected');
      const roulettePubkey = new PublicKey(roulette);
      return program.spinRoulette(roulettePubkey);
    },
    onSuccess: () => {
      // Log program event for spin trigger
      console.log('🎰 [PROGRAM EVENT] Spin Triggered | Action: SpinRoulette');

      queryClient.invalidateQueries({ queryKey: ['roulettes'] });
      toast.success('Roulette spin initiated!');
    },
    onError: error => {
      const errorMessage = handleProgramError(error);
      toast.error('Spin roulette failed', { description: errorMessage });
    },
  });

  // Claim winnings
  const claimWinnings = useMutation({
    mutationFn: ({ roulette, bet }: { roulette: string; bet: string }) => {
      if (!program) throw new Error('Wallet not connected');
      const roulettePubkey = new PublicKey(roulette);
      const betPubkey = new PublicKey(bet);
      return program.claimWinnings(roulettePubkey, betPubkey);
    },
    onSuccess: () => {
      // Log program event for winning claims
      console.log(
        '🎰 [PROGRAM EVENT] Winnings Claimed Successfully | Action: ClaimWinnings'
      );

      queryClient.invalidateQueries({ queryKey: ['roulettes'] });
      toast.success('Winnings claimed successfully!');
    },
    onError: error => {
      const errorMessage = handleProgramError(error);
      toast.error('Claim winnings failed', { description: errorMessage });
    },
  });

  // Get roulette account by address
  const getRouletteAccount = useCallback(
    async (address: string) => {
      if (!program) throw new Error('Wallet not connected');
      const roulettePubkey = new PublicKey(address);
      return program.fetchRouletteAccount(roulettePubkey);
    },
    [program]
  );

  // Get bets for a specific roulette
  const getBetsForRoulette = useCallback(
    async (roulette: string) => {
      if (!program) throw new Error('Wallet not connected');
      const roulettePubkey = new PublicKey(roulette);
      return program.getBetsForRoulette(roulettePubkey);
    },
    [program]
  );

  // Get user's bets
  const getUserBets = useCallback(async () => {
    if (!program || !publicKey) throw new Error('Wallet not connected');
    return program.getUserBets(publicKey);
  }, [program, publicKey]);

  // Expire all current games (admin cleanup)
  const expireAllGames = useMutation({
    mutationFn: () => {
      if (!program) throw new Error('Wallet not connected');
      return program.expireAllCurrentGames();
    },
    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: ['roulettes'] });
      toast.success(
        `Game cleanup completed! Processed ${result.processedGames}/${result.totalGames} games`
      );
    },
    onError: error => {
      const errorMessage = handleProgramError(error);
      toast.error('Game cleanup failed', { description: errorMessage });
    },
  });

  // Process automation manually (for admin control)
  const processAutomation = useMutation({
    mutationFn: () => {
      if (!program) throw new Error('Wallet not connected');
      return program.processAutomation();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roulettes'] });
      toast.success('Automation cycle processed successfully!');
    },
    onError: error => {
      const errorMessage = handleProgramError(error);
      toast.error('Automation processing failed', {
        description: errorMessage,
      });
    },
  });

  // Test function to simulate events for debugging
  const testEventLogging = useCallback(() => {
    console.log('🧪 [TEST] Simulating program events for debugging...');

    // Simulate RouletteSpun event
    console.log('🎰 [PROGRAM EVENT] Winning Number Generated |', {
      slot: 12345,
      rouletteId: 'SIMULATED_GAME_ID',
      winningNumber: '17',
      totalWinners: '3',
      totalPayouts: '150000000',
      houseEdgeCollected: '7500000',
      treasuryFeeCollected: '2500000',
      timestamp: new Date().toLocaleString(),
    });

    console.log('🎯 [WINNING NUMBER] 17 | Game: SIMULATE...');
    console.warn('🎯 WINNING NUMBER: 17');

    // Simulate BetPlaced event
    console.log('🎰 [PROGRAM EVENT] Bet Placed |', {
      slot: 12346,
      rouletteId: 'SIMULATED_GAME_ID',
      betId: '1',
      bettor: 'TEST_BETTOR',
      betType: 'Straight',
      betAmount: '5000000',
      totalBets: '1',
      timestamp: new Date().toLocaleString(),
    });
  }, []);

  return {
    roulettes,
    isLoading,
    error,
    isInitialized,
    initialize: initialize.mutateAsync,
    createRoulette: createRoulette.mutateAsync,
    createNextGame: createNextGame.mutateAsync,
    placeBet: placeBet.mutateAsync,
    lockBetting: lockBetting.mutateAsync,
    spinRoulette: spinRoulette.mutateAsync,
    claimWinnings: claimWinnings.mutateAsync,
    expireAllGames: expireAllGames.mutateAsync,
    processAutomation: processAutomation.mutateAsync,
    getRouletteAccount,
    getBetsForRoulette,
    getUserBets,
    isInitializing: initialize.isPending,
    isCreating: createRoulette.isPending,
    isCreatingNext: createNextGame.isPending,
    isPlacingBet: placeBet.isPending,
    isLockingBetting: lockBetting.isPending,
    isSpinning: spinRoulette.isPending,
    isClaimingWinnings: claimWinnings.isPending,
    isExpiringGames: expireAllGames.isPending,
    isProcessingAutomation: processAutomation.isPending,
  };
}
