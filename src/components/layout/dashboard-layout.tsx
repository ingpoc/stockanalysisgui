"use client"

import { useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { LayoutGrid, LineChart, Brain, Search } from "lucide-react"
import Link from "next/link"

function SidebarItem({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  return (
    <Link 
      href="#"
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F0F0F]">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-hidden bg-[#1C1C1C] duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 px-6 py-5.5 lg:py-6.5">
          <h2 className="text-xl font-bold text-white">Stock Analysis</h2>
        </div>

        <div className="flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 py-4 px-4 space-y-2">
            <SidebarItem icon={LayoutGrid} label="Market Overview" active />
            <SidebarItem icon={LineChart} label="Stock Analysis" />
            <SidebarItem icon={Brain} label="AI Insights" />
          </nav>
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 flex w-full bg-[#1C1C1C] border-b border-gray-800">
          <div className="flex flex-grow items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 rounded-lg bg-gray-800 text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 bg-[#0F0F0F]">
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 