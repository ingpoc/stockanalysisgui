"use client"

import { useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { WalletButton } from "@/components/auth/wallet-button"
import { 
  LayoutGrid, 
  Menu,
  ChevronRight,
  ChevronLeft,
  Settings,
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
      className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white dark:text-white' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </button>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0F0F0F]">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden bg-white dark:bg-[#1C1C1C] border-r border-gray-200 dark:border-gray-800 duration-300 ease-linear lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-[72px]' : 'w-64'}`}
      >
        <div className={`flex items-center gap-2 px-4 py-4 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
          {isCollapsed ? (
            <Dice6 className="h-8 w-8 text-blue-600" />
          ) : (
            <>
              <Dice6 className="h-8 w-8 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crypto Lottery</h2>
            </>
          )}
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear">
          <nav className="mt-2 px-3 space-y-1">
            <SidebarItem icon={LayoutGrid} label="Dashboard" href="/dashboard" isCollapsed={isCollapsed} />
            <SidebarItem icon={Ticket} label="Active Lotteries" href="/lottery" isCollapsed={isCollapsed} />
          </nav>

          <div className="mt-auto px-3 py-4 space-y-1">
            <SidebarItem icon={Settings} label="Settings" href="/settings" isCollapsed={isCollapsed} />
            <SidebarItem icon={HelpCircle} label="Help & Support" href="/help" isCollapsed={isCollapsed} />
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center h-10 w-full border-t border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </aside>

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 flex w-full bg-white dark:bg-[#1C1C1C] border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-grow items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <Dice6 className="h-6 w-6 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Decentralized Lottery Platform
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <WalletButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 