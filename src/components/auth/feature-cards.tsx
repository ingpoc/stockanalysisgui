'use client'

import dynamic from 'next/dynamic'
import { TrendingUp, Lock, LineChart, Zap } from 'lucide-react'

export function FeatureCards() {
  return (
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
  )
} 