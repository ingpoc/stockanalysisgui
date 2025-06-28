'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { RouletteFallback } from './roulette-game-fallback'

interface Props {
  children: ReactNode
  playerWallet?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class RouletteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.error('Roulette Error Boundary caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Roulette Error Boundary - Component Stack:', errorInfo.componentStack)
    console.error('Roulette Error Boundary - Error:', error)
    
    // Check if it's a React version conflict error
    if (error.message.includes('ReactCurrentOwner') || 
        error.message.includes('react-reconciler') ||
        error.message.includes('Cannot read properties of undefined')) {
      console.log('Detected React version conflict, falling back to 2D mode')
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback to 2D roulette game
      return <RouletteFallback playerWallet={this.props.playerWallet} />
    }

    return this.props.children
  }
}