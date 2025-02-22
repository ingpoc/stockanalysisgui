'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { cn } from '@/lib/utils'

require('@solana/wallet-adapter-react-ui/styles.css')

interface WalletButtonProps {
  variant?: 'default' | 'large'
  className?: string
}

const buttonStyles = {
  default: {
    height: '40px',
    padding: '0 24px',
    borderRadius: '6px',
    fontSize: '14px',
  },
  large: {
    height: '48px',
    padding: '0 32px',
    borderRadius: '8px',
    fontSize: '16px',
  }
}

export function WalletButton({ variant = 'default', className }: WalletButtonProps) {
  const { publicKey, connected } = useWallet()

  return (
    <WalletMultiButton
      className={cn(
        "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm",
        className
      )}
      style={{
        ...buttonStyles[variant],
        fontWeight: 500,
        border: 'none'
      }}
    >
      {connected && publicKey ? 
        `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-4)}` : 
        'Connect Wallet'
      }
    </WalletMultiButton>
  )
} 