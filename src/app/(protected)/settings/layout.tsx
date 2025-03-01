import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Settings | Stock Analysis Dashboard',
  description: 'Configure application settings and integrations',
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
} 