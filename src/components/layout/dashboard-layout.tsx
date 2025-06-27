"use client"

import { useState, useEffect, useRef } from "react"
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from "@/components/auth/wallet-button"
import { ADMIN_WALLET } from '@/lib/constants'
import { gsap } from 'gsap'
import { 
  LayoutGrid, 
  Menu,
  ChevronRight,
  ChevronLeft,
  Shield,
  HelpCircle,
  Ticket,
  Dice6
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

function SidebarItem({ 
  icon: Icon, 
  label, 
  href = "/dashboard", 
  isCollapsed = false,
  onClick
}: { 
  icon: any
  label: string
  href?: string
  isCollapsed?: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = pathname === href

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onClick) {
      onClick()
    } else {
      router.push(href)
    }
  }

  return (
    <button 
      onClick={handleClick}
      className={`flex w-full items-center gap-3 py-3 transition-colors ${
        isActive 
          ? 'text-gray-900 border-r-2 border-gray-900' 
          : 'text-gray-600 hover:text-gray-900'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && <span className="text-xs uppercase tracking-wider">{label}</span>}
    </button>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { publicKey } = useWallet()
  const sidebarRef = useRef<HTMLElement>(null)
  const mainContentRef = useRef<HTMLElement>(null)
  
  // Check if user is admin
  const isAdmin = publicKey?.toBase58() === ADMIN_WALLET

  // Animate sidebar collapse/expand
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isCollapsed ? '72px' : '256px',
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }, [isCollapsed])

  // Animate mobile sidebar
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        x: isMobileOpen ? 0 : '-100%',
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }, [isMobileOpen])

  // Initial page load animation
  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(mainContentRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6,
          delay: 0.1,
          ease: "power2.out"
        }
      )
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className="fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden bg-white border-r border-gray-200 lg:static w-64"
        style={{ transform: 'translateX(-100%)' }}
      >
        <div className={`border-b border-gray-200 px-6 py-8 ${isCollapsed ? 'px-4' : ''}`}>
          {isCollapsed ? (
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider">CL</div>
            </div>
          ) : (
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">CRYPTO LOTTERY</div>
              <div className="text-sm text-gray-600">Decentralized Platform</div>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear">
          <nav className={`py-8 space-y-2 ${isCollapsed ? 'px-4' : 'px-6'}`}>
            <SidebarItem icon={LayoutGrid} label="Dashboard" href="/dashboard" isCollapsed={isCollapsed} />
            <SidebarItem icon={Ticket} label="Active Lotteries" href="/lottery" isCollapsed={isCollapsed} />
          </nav>

          <div className={`mt-auto py-8 space-y-2 border-t border-gray-200 ${isCollapsed ? 'px-4' : 'px-6'}`}>
            {isAdmin && (
              <SidebarItem icon={Shield} label="Admin" href="/admin" isCollapsed={isCollapsed} />
            )}
            <SidebarItem icon={HelpCircle} label="Help & Support" href="/help" isCollapsed={isCollapsed} />
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center h-12 w-full border-t border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-gray-400" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-400" />
          )}
        </button>
      </aside>

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 flex w-full bg-white border-b border-gray-200">
          <div className="flex flex-grow items-center justify-between px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">DECENTRALIZED LOTTERY PLATFORM</div>
              </div>
            </div>
            <div className="flex items-center">
              <WalletButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main ref={mainContentRef} className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  )
} 