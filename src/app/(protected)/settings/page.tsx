"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MoneyControlScraperSettings from './moneycontrol-scraper/moneycontrol-settings'
import DatabaseManagementSettings from './database-management/database-management'

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="integrations">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations" className="space-y-4 mt-4">
          <h2 className="text-xl font-semibold mb-4">Data Integrations</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>MoneyControl Scraper</CardTitle>
                <CardDescription>
                  Configure and run the MoneyControl data scraper
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MoneyControlScraperSettings />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Zerodha Integration</CardTitle>
                <CardDescription>
                  Connect your Zerodha account to sync portfolio data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link 
                  href="/settings/zerodha"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Connect Zerodha
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="database" className="space-y-4 mt-4">
          <h2 className="text-xl font-semibold mb-4">Database Management</h2>
          <DatabaseManagementSettings />
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
          <p>Appearance settings coming soon...</p>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4 mt-4">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <p>Account settings coming soon...</p>
        </TabsContent>
      </Tabs>
    </div>
  )
} 