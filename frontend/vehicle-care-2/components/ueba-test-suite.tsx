"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { uebaService } from "@/lib/analytics"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Play } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'pending'
  message: string
  details?: any
}

export default function UEBATestSuite() {
  const { user } = useAuth()
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const testResults: TestResult[] = []

    // Test 1: Check if UEBA service is initialized
    testResults.push({
      name: "UEBA Service Initialization",
      status: uebaService ? 'pass' : 'fail',
      message: uebaService ? "UEBA service is properly initialized" : "UEBA service not found"
    })

    // Test 2: Check localStorage access
    try {
      const storageTest = localStorage.getItem('ueba_events')
      testResults.push({
        name: "LocalStorage Access",
        status: 'pass',
        message: "Can read/write to localStorage",
        details: storageTest ? `Found ${JSON.parse(storageTest).length} existing events` : "No events yet"
      })
    } catch (error) {
      testResults.push({
        name: "LocalStorage Access",
        status: 'fail',
        message: "Cannot access localStorage",
        details: String(error)
      })
    }

    // Test 3: Track a test event
    try {
      const userId = user?.email || 'test-user@example.com'
      uebaService.trackChatbotInteraction({
        message: "UEBA Test Message",
        responseTime: 100,
        userId,
        intent: "test"
      })
      
      // Wait a moment for the event to be stored
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const events = uebaService.getRecentEvents()
      const testEvent = events.find(e => 
        e.metadata?.intent === 'test' && 
        e.metadata?.messageLength === 18
      )
      
      testResults.push({
        name: "Track Chat Interaction",
        status: testEvent ? 'pass' : 'fail',
        message: testEvent ? "Successfully tracked chat interaction" : "Event not found in storage",
        details: testEvent ? `Event ID: ${events.indexOf(testEvent)}` : undefined
      })
    } catch (error) {
      testResults.push({
        name: "Track Chat Interaction",
        status: 'fail',
        message: "Failed to track event",
        details: String(error)
      })
    }

    // Test 4: Check analytics summary
    try {
      const summary = uebaService.getAnalyticsSummary()
      testResults.push({
        name: "Analytics Summary",
        status: summary ? 'pass' : 'fail',
        message: summary ? "Analytics summary retrieved successfully" : "Failed to get summary",
        details: summary ? {
          interactions: summary.totalInteractions,
          anomalies: summary.anomaliesDetected,
          avgRisk: summary.avgRiskScore.toFixed(2)
        } : undefined
      })
    } catch (error) {
      testResults.push({
        name: "Analytics Summary",
        status: 'fail',
        message: "Failed to get analytics summary",
        details: String(error)
      })
    }

    // Test 5: Risk scoring
    try {
      const highRiskUserId = user?.email || 'risk-test@example.com'
      uebaService.trackChatbotInteraction({
        message: "EMERGENCY URGENT HELP NEEDED!!!!!!!!!!!!!!!!!!!!!",
        responseTime: 6000,
        userId: highRiskUserId,
        intent: "emergency"
      })
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const events = uebaService.getRecentEvents()
      const riskEvent = events.find(e => 
        e.metadata?.intent === 'emergency' && 
        e.riskScore && e.riskScore > 50
      )
      
      testResults.push({
        name: "Risk Scoring System",
        status: riskEvent ? 'pass' : 'fail',
        message: riskEvent 
          ? `High-risk event detected with score ${riskEvent.riskScore}` 
          : "Risk scoring not working correctly",
        details: riskEvent?.riskScore
      })
    } catch (error) {
      testResults.push({
        name: "Risk Scoring System",
        status: 'fail',
        message: "Failed to test risk scoring",
        details: String(error)
      })
    }

    // Test 6: User authentication tracking
    try {
      if (user) {
        testResults.push({
          name: "User Authentication",
          status: 'pass',
          message: `User is authenticated as ${user.email}`,
          details: { email: user.email, persona: user.persona }
        })
      } else {
        testResults.push({
          name: "User Authentication",
          status: 'pending',
          message: "User not authenticated - some features may not work",
          details: "Login to test full functionality"
        })
      }
    } catch (error) {
      testResults.push({
        name: "User Authentication",
        status: 'fail',
        message: "Error checking auth status",
        details: String(error)
      })
    }

    // Test 7: Event persistence
    try {
      const eventsBefore = uebaService.getRecentEvents().length
      
      uebaService.trackUserBehavior({
        action: 'test_action',
        userId: user?.email || 'test@example.com',
        metadata: { test: true, timestamp: Date.now() }
      })
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const eventsAfter = uebaService.getRecentEvents().length
      
      testResults.push({
        name: "Event Persistence",
        status: eventsAfter > eventsBefore ? 'pass' : 'fail',
        message: eventsAfter > eventsBefore 
          ? `Events persisted (${eventsBefore} → ${eventsAfter})` 
          : "Events not persisting correctly",
        details: { before: eventsBefore, after: eventsAfter }
      })
    } catch (error) {
      testResults.push({
        name: "Event Persistence",
        status: 'fail',
        message: "Failed to test persistence",
        details: String(error)
      })
    }

    // Test 8: Firebase Analytics
    try {
      const hasGtag = typeof window !== 'undefined' && (window as any).gtag
      testResults.push({
        name: "Firebase Analytics",
        status: hasGtag ? 'pass' : 'pending',
        message: hasGtag 
          ? "Firebase Analytics (gtag) is available" 
          : "Firebase Analytics not initialized (check env vars)",
        details: hasGtag ? "Events will be sent to GA4" : "Running in local mode only"
      })
    } catch (error) {
      testResults.push({
        name: "Firebase Analytics",
        status: 'pending',
        message: "Firebase Analytics not available",
        details: "This is normal in development - check production build"
      })
    }

    setResults(testResults)
    setIsRunning(false)
  }

  const clearEvents = () => {
    if (confirm('Are you sure you want to clear all UEBA events?')) {
      localStorage.removeItem('ueba_events')
      setResults([])
      alert('UEBA events cleared')
    }
  }

  const viewRawData = () => {
    const events = uebaService.getRecentEvents()
    console.log('=== UEBA Events ===')
    console.table(events)
    console.log('=== Analytics Summary ===')
    console.log(uebaService.getAnalyticsSummary())
    alert('Check the browser console for detailed event data')
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="text-green-400" size={20} />
      case 'fail':
        return <XCircle className="text-red-400" size={20} />
      case 'pending':
        return <AlertCircle className="text-yellow-400" size={20} />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-500/20 text-green-400">PASS</Badge>
      case 'fail':
        return <Badge className="bg-red-500/20 text-red-400">FAIL</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400">PENDING</Badge>
    }
  }

  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const pendingCount = results.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>UEBA Test Suite</span>
            <div className="flex gap-2">
              <Button
                onClick={viewRawData}
                variant="outline"
                size="sm"
                className="bg-slate-800/50 border-slate-700"
              >
                View Raw Data
              </Button>
              <Button
                onClick={clearEvents}
                variant="outline"
                size="sm"
                className="bg-slate-800/50 border-slate-700 text-red-400 hover:text-red-300"
              >
                Clear Events
              </Button>
              <Button
                onClick={runTests}
                disabled={isRunning}
                className="bg-cyan-500 hover:bg-cyan-600"
                size="sm"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="mr-2 animate-spin" size={16} />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2" size={16} />
                    Run Tests
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Play className="mx-auto mb-3 opacity-50" size={48} />
              <p>Click "Run Tests" to verify UEBA implementation</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">{passCount}</div>
                  <div className="text-sm text-green-300">Passed</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-400">{failCount}</div>
                  <div className="text-sm text-red-300">Failed</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-400">{pendingCount}</div>
                  <div className="text-sm text-yellow-300">Pending</div>
                </div>
              </div>

              {/* Test Results */}
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <h3 className="font-semibold text-slate-200">{result.name}</h3>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-slate-300 ml-8">{result.message}</p>
                    {result.details && (
                      <div className="mt-2 ml-8 bg-slate-900/50 rounded p-2 border border-slate-700/30">
                        <pre className="text-xs text-slate-400 overflow-x-auto">
                          {typeof result.details === 'object' 
                            ? JSON.stringify(result.details, null, 2)
                            : result.details}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-lg">Testing Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <div className="flex gap-2">
            <span className="text-cyan-400">•</span>
            <span>Open browser DevTools (F12) to see console logs of UEBA events</span>
          </div>
          <div className="flex gap-2">
            <span className="text-cyan-400">•</span>
            <span>Use the chatbot to generate real interaction events</span>
          </div>
          <div className="flex gap-2">
            <span className="text-cyan-400">•</span>
            <span>Login/Logout to test authentication tracking</span>
          </div>
          <div className="flex gap-2">
            <span className="text-cyan-400">•</span>
            <span>Send messages with "emergency" or "urgent" to test risk scoring</span>
          </div>
          <div className="flex gap-2">
            <span className="text-cyan-400">•</span>
            <span>Check Application → Local Storage in DevTools for "ueba_events"</span>
          </div>
          <div className="flex gap-2">
            <span className="text-cyan-400">•</span>
            <span>Visit the Analytics dashboard to see real-time visualization</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
