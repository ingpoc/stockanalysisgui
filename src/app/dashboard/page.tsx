'use client'

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockDashboard } from "@/components/stock-dashboard"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <StockDashboard />
    </DashboardLayout>
  )
} 