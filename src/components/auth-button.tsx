'use client';

import type { FC } from 'react';
import { Button } from "@/components/ui/button"
import { useAuth } from "@/auth/auth-context"
import { useAccount, useConnect, useDisconnect } from "wagmi"

export const AuthButton: FC = () => {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button
          variant="secondary"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="default"
      onClick={() => connect({ connector: connectors[0] })}
    >
      Connect Wallet
    </Button>
  )
} 