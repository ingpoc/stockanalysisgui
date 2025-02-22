'use client'

import dynamic from 'next/dynamic'
import { AuthGuard } from '@/components/auth/auth-guard'
import { WalletButton } from '@/components/auth/wallet-button'
import { Skeleton } from '@/components/ui/skeleton'

require('@solana/wallet-adapter-react-ui/styles.css')

// Lazy load feature cards
const FeatureCards = dynamic(() => import('@/components/auth/feature-cards').then(mod => mod.FeatureCards), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50">
          <div className="h-8 w-8 bg-primary/20 rounded mb-4" />
          <div className="h-6 w-32 bg-primary/20 rounded mb-2" />
          <div className="h-4 w-full bg-primary/10 rounded" />
        </div>
      ))}
    </div>
  ),
  ssr: false
})

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="flex flex-col lg:flex-row">
        {/* Left side - Hero/Features */}
        <div className="relative lg:w-1/2 bg-gradient-to-br from-primary/5 via-primary/10 to-background p-8 lg:p-12 flex items-center">
          <div className="relative z-10 w-full max-w-2xl mx-auto">
            <div className="text-center lg:text-left space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Stock Analysis
                  <span className="text-primary"> Dashboard</span>
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Advanced analytics and real-time insights powered by blockchain technology
                </p>
              </div>
              
              <FeatureCards />
            </div>
          </div>
        </div>

        {/* Right side - Login */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Welcome Back</h2>
              <p className="mt-2 text-muted-foreground">
                Connect your wallet to continue
              </p>
            </div>
            <div className="flex justify-center">
              <WalletButton variant="large" />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 