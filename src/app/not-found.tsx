'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LineChart, ArrowLeft } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function NotFound() {
  return (
    <DashboardLayout>
      <div className="flex h-full flex-col items-center justify-center p-6">
        <div className="flex max-w-[32rem] flex-col items-center gap-4 text-center">
          <LineChart className="h-16 w-16 text-blue-600 dark:text-blue-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Feature Coming Soon</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            This feature is currently under development. Stay tuned for updates!
          </p>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 