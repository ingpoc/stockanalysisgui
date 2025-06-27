'use client'

import { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'

interface WalletButtonProps {
  variant?: 'default' | 'large'
  className?: string
}

export function WalletButton({ variant = 'default', className }: WalletButtonProps) {
  const { publicKey, connected, disconnect, wallet } = useWallet()
  const { setVisible } = useWalletModal()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Animate dropdown open/close
  useEffect(() => {
    if (dropdownContentRef.current) {
      if (isOpen) {
        gsap.fromTo(dropdownContentRef.current,
          { opacity: 0, y: -10, scale: 0.95 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          }
        )
      }
    }
  }, [isOpen])

  const handleConnect = () => {
    setVisible(true)
  }

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      setIsOpen(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsOpen(false)
  }

  const handleViewExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`, '_blank')
      setIsOpen(false)
    }
  }

  if (!connected || !publicKey) {
    return (
      <button
        onClick={handleConnect}
        className={cn(
          "px-4 py-2 text-xs text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200 uppercase tracking-wider",
          className
        )}
      >
        Connect
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-xs border border-gray-300 hover:border-gray-900 transition-colors duration-200",
          isOpen && "border-gray-900",
          className
        )}
      >
        <div className="text-right">
          <div className="text-xs text-gray-600 font-mono">
            {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
          </div>
        </div>
        <ChevronDown className={cn(
          "h-3 w-3 text-gray-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div 
          ref={dropdownContentRef}
          className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg z-50"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Connected Wallet</div>
            <div className="text-sm font-mono text-gray-900 break-all">
              {publicKey.toBase58()}
            </div>
            {wallet?.adapter.name && (
              <div className="text-xs text-gray-500 mt-1">
                {wallet.adapter.name}
              </div>
            )}
          </div>
          
          <div className="py-2">
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy Address
            </button>
            
            <button
              onClick={handleViewExplorer}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </button>
            
            <hr className="my-2" />
            
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 