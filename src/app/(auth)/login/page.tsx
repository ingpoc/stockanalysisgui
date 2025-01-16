'use client'

import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Wallet } from 'lucide-react'
import { modal } from '@/config'

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
  const router = useRouter()
  const { isConnected, status } = useAccount()

  useEffect(() => {
    if (status === 'connected' && isConnected) {
      router.replace('/dashboard')
    }
  }, [isConnected, router, status])

  const handleConnect = async () => {
    try {
      await modal.open()
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  // Show loading state when not disconnected
  if (status !== 'disconnected') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">
            Connecting wallet...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
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
          
          <Button
            onClick={handleConnect}
            size="lg"
            className="w-full py-6 text-lg relative overflow-hidden group"
            disabled={status !== 'disconnected'}
          >
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
            <div className="relative flex items-center justify-center gap-3">
              <Wallet className="h-5 w-5" />
              <span>Connect Wallet</span>
            </div>
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>By connecting, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  )
} 