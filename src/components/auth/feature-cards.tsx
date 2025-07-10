'use client';

import { Coins, Lock, Trophy, Zap } from 'lucide-react';

// Dynamically import icons

export function FeatureCards() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <div className='bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-colors'>
        <Coins className='h-8 w-8 text-primary mb-4' />
        <h3 className='font-semibold text-lg'>USDC Prizes</h3>
        <p className='text-muted-foreground mt-2'>
          Win real USDC prizes in decentralized lotteries
        </p>
      </div>
      <div className='bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-colors'>
        <Lock className='h-8 w-8 text-primary mb-4' />
        <h3 className='font-semibold text-lg'>Provably Fair</h3>
        <p className='text-muted-foreground mt-2'>
          Transparent randomness using Solana blockchain
        </p>
      </div>
      <div className='bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-colors'>
        <Trophy className='h-8 w-8 text-primary mb-4' />
        <h3 className='font-semibold text-lg'>Instant Wins</h3>
        <p className='text-muted-foreground mt-2'>
          Automated prize distribution to winners
        </p>
      </div>
      <div className='bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-colors'>
        <Zap className='h-8 w-8 text-primary mb-4' />
        <h3 className='font-semibold text-lg'>Low Fees</h3>
        <p className='text-muted-foreground mt-2'>
          Minimal Solana transaction fees
        </p>
      </div>
    </div>
  );
}
