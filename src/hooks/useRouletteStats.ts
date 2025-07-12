'use client';

import { useState, useEffect, useCallback } from 'react';

interface GameSession {
  id: string;
  timestamp: number;
  betAmount: number;
  betType: string;
  numbers: number[];
  winningNumber: number;
  won: boolean;
  payout: number;
}

interface RouletteStats {
  totalGames: number;
  totalBets: number;
  totalWinnings: number;
  totalLosses: number;
  winRate: number;
  biggestWin: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  hotNumbers: { number: number; frequency: number }[];
  coldNumbers: { number: number; frequency: number }[];
  recentSessions: GameSession[];
  favoriteBetTypes: { type: string; count: number }[];
}

export function useRouletteStats() {
  const [stats, setStats] = useState<RouletteStats>({
    totalGames: 0,
    totalBets: 0,
    totalWinnings: 0,
    totalLosses: 0,
    winRate: 0,
    biggestWin: 0,
    longestWinStreak: 0,
    longestLoseStreak: 0,
    hotNumbers: [],
    coldNumbers: [],
    recentSessions: [],
    favoriteBetTypes: [],
  });

  const [numberFrequency, setNumberFrequency] = useState<Map<number, number>>(
    new Map()
  );
  const [currentStreak, setCurrentStreak] = useState({
    type: 'none',
    count: 0,
  });

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('roulette-stats');
    const savedFrequency = localStorage.getItem('roulette-frequency');

    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (error) {
        console.warn('Failed to load roulette stats:', error);
      }
    }

    if (savedFrequency) {
      try {
        const frequencyArray = JSON.parse(savedFrequency);
        setNumberFrequency(new Map(frequencyArray));
      } catch (error) {
        console.warn('Failed to load number frequency:', error);
      }
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('roulette-stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(
      'roulette-frequency',
      JSON.stringify(Array.from(numberFrequency.entries()))
    );
  }, [numberFrequency]);

  const recordGameSession = useCallback(
    (
      betAmount: number,
      betType: string,
      numbers: number[],
      winningNumber: number,
      won: boolean,
      payout: number
    ) => {
      const session: GameSession = {
        id: `session-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        betAmount,
        betType,
        numbers,
        winningNumber,
        won,
        payout,
      };

      // Update number frequency
      setNumberFrequency(prev => {
        const newFreq = new Map(prev);
        const currentCount = newFreq.get(winningNumber) || 0;
        newFreq.set(winningNumber, currentCount + 1);
        return newFreq;
      });

      // Update streak tracking
      setCurrentStreak(prev => {
        if (won) {
          return prev.type === 'win'
            ? { type: 'win', count: prev.count + 1 }
            : { type: 'win', count: 1 };
        } else {
          return prev.type === 'lose'
            ? { type: 'lose', count: prev.count + 1 }
            : { type: 'lose', count: 1 };
        }
      });

      setStats(prev => {
        const newStats = {
          ...prev,
          totalGames: prev.totalGames + 1,
          totalBets: prev.totalBets + betAmount,
          totalWinnings: won ? prev.totalWinnings + payout : prev.totalWinnings,
          totalLosses: won ? prev.totalLosses : prev.totalLosses + betAmount,
          biggestWin: won ? Math.max(prev.biggestWin, payout) : prev.biggestWin,
          recentSessions: [session, ...prev.recentSessions.slice(0, 49)], // Keep last 50 sessions
        };

        // Calculate win rate
        newStats.winRate =
          newStats.totalGames > 0
            ? Math.round(
                (newStats.totalWinnings /
                  (newStats.totalWinnings + newStats.totalLosses)) *
                  100
              )
            : 0;

        // Update streaks
        if (won && currentStreak.type === 'win') {
          newStats.longestWinStreak = Math.max(
            prev.longestWinStreak,
            currentStreak.count
          );
        } else if (!won && currentStreak.type === 'lose') {
          newStats.longestLoseStreak = Math.max(
            prev.longestLoseStreak,
            currentStreak.count
          );
        }

        // Update bet type frequency
        const betTypeMap = new Map<string, number>();
        newStats.recentSessions.forEach(s => {
          betTypeMap.set(s.betType, (betTypeMap.get(s.betType) || 0) + 1);
        });

        newStats.favoriteBetTypes = Array.from(betTypeMap.entries())
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return newStats;
      });
    },
    [currentStreak]
  );

  // Calculate hot and cold numbers
  useEffect(() => {
    const frequencies = Array.from(numberFrequency.entries())
      .map(([number, frequency]) => ({ number, frequency }))
      .sort((a, b) => b.frequency - a.frequency);

    const hotNumbers = frequencies.slice(0, 5);
    const coldNumbers = frequencies.slice(-5).reverse();

    setStats(prev => ({
      ...prev,
      hotNumbers,
      coldNumbers,
    }));
  }, [numberFrequency]);

  const resetStats = useCallback(() => {
    setStats({
      totalGames: 0,
      totalBets: 0,
      totalWinnings: 0,
      totalLosses: 0,
      winRate: 0,
      biggestWin: 0,
      longestWinStreak: 0,
      longestLoseStreak: 0,
      hotNumbers: [],
      coldNumbers: [],
      recentSessions: [],
      favoriteBetTypes: [],
    });
    setNumberFrequency(new Map());
    setCurrentStreak({ type: 'none', count: 0 });
    localStorage.removeItem('roulette-stats');
    localStorage.removeItem('roulette-frequency');
  }, []);

  const getSessionsByDateRange = useCallback(
    (days: number): GameSession[] => {
      const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
      return stats.recentSessions.filter(
        session => session.timestamp >= cutoffTime
      );
    },
    [stats.recentSessions]
  );

  const getTotalProfit = useCallback((): number => {
    return stats.totalWinnings - stats.totalLosses;
  }, [stats.totalWinnings, stats.totalLosses]);

  const getAverageWin = useCallback((): number => {
    const winSessions = stats.recentSessions.filter(s => s.won);
    if (winSessions.length === 0) return 0;
    return (
      winSessions.reduce((sum, s) => sum + s.payout, 0) / winSessions.length
    );
  }, [stats.recentSessions]);

  const getAverageLoss = useCallback((): number => {
    const loseSessions = stats.recentSessions.filter(s => !s.won);
    if (loseSessions.length === 0) return 0;
    return (
      loseSessions.reduce((sum, s) => sum + s.betAmount, 0) /
      loseSessions.length
    );
  }, [stats.recentSessions]);

  return {
    stats,
    recordGameSession,
    resetStats,
    getSessionsByDateRange,
    getTotalProfit,
    getAverageWin,
    getAverageLoss,
    currentStreak,
  };
}
