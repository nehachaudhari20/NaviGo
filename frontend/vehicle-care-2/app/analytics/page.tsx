"use client"

import { useEffect, useState } from "react"
import UEBADashboard from "@/components/ueba-dashboard"
import UEBATestSuite from "@/components/ueba-test-suite"
import { trackPageView } from "@/lib/firebase-analytics"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
  useEffect(() => {
    trackPageView('/analytics', 'UEBA Analytics Dashboard')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            UEBA Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            Real-time User and Entity Behavior Analytics for AI Agents
          </p>
        </div>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="bg-slate-900/50 border border-slate-700/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="testing">Test Suite</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <UEBADashboard />
          </TabsContent>
          
          <TabsContent value="testing" className="mt-6">
            <UEBATestSuite />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
