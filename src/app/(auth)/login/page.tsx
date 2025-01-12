'use client'

import { useAppKit } from '@reown/appkit/react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Wallet, LineChart, Lock, TrendingUp, Zap } from 'lucide-react'

export default function LoginPage() {
  const { open } = useAppKit()
  const router = useRouter()
  const { isConnected, status } = useAccount()

  useEffect(() => {
    if (status === 'connected' && isConnected) {
      router.replace('/dashboard')
    }
  }, [isConnected, router, status])

  const handleConnect = async () => {
    try {
      await open()
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
                <TrendingUp className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg">Real-time Analysis</h3>
                <p className="text-muted-foreground mt-2">Track market trends and get instant insights</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
                <Lock className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg">Secure Access</h3>
                <p className="text-muted-foreground mt-2">Protected by blockchain technology</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
                <LineChart className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg">Advanced Charts</h3>
                <p className="text-muted-foreground mt-2">Comprehensive technical analysis tools</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
                <Zap className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg">AI Insights</h3>
                <p className="text-muted-foreground mt-2">Smart predictions and recommendations</p>
              </div>
            </div>
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