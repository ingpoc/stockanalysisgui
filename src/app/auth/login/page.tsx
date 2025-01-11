'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const { connect, isConnected, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleAuth = async (method: 'wallet' | 'google' | 'apple' | 'email') => {
    try {
      await connect({ method })
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Auth Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 p-2">
              <Icons.chart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-6 text-2xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue to Stock Analysis Dashboard
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => handleAuth('wallet')}
              disabled={isConnected}
            >
              <Icons.wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" onClick={() => handleAuth('google')}>
                <Icons.google className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="secondary" onClick={() => handleAuth('apple')}>
                <Icons.apple className="mr-2 h-4 w-4" />
                Apple
              </Button>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleAuth('email')}
            >
              <Icons.mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>

          {/* Features List */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Features included:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center">
                <Icons.check className="mr-2 h-4 w-4" />
                Real-time market analysis
              </li>
              <li className="flex items-center">
                <Icons.check className="mr-2 h-4 w-4" />
                AI-powered insights
              </li>
              <li className="flex items-center">
                <Icons.check className="mr-2 h-4 w-4" />
                Technical analysis tools
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Background */}
      <div className="hidden lg:block relative bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-blue-800 to-gray-900">
          <div className="absolute inset-0 bg-grid-white/[0.05]" />
          <div className="relative h-full flex items-center justify-center text-white">
            <div className="space-y-4 text-center p-8">
              <h1 className="text-4xl font-bold">Stock Analysis Dashboard</h1>
              <p className="text-xl text-gray-300">Advanced analytics powered by AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 