import { StockDashboard } from '@/components/stock-dashboard'

// Convert to server component and enable ISR
export const revalidate = 60 // revalidate every 60 seconds (ISR)
export default async function DashboardPage() {
  // Server component can pass initial props if needed
  return <StockDashboard />
} 