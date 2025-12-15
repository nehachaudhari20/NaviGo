"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"
import ServiceCenterSidebar from "@/components/service-center/sidebar"
import ServiceCenterHeader from "@/components/service-center/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Shield,
  Zap,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Settings,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface WorkerAgent {
  id: string
  name: string
  status: "active" | "idle" | "error"
  currentTask: string
  tasksCompleted: number
  successRate: number
  lastActivity: string
  icon: any
  color: string
}

interface AgentActivity {
  id: string
  timestamp: string
  agent: string
  action: string
  status: "success" | "warning" | "error"
  details: string
}

const workerAgents: WorkerAgent[] = [
  {
    id: "data-analysis",
    name: "Data Analysis Agent",
    status: "active",
    currentTask: "Analyzing telematics for 10 vehicles",
    tasksCompleted: 1247,
    successRate: 98.5,
    lastActivity: "2 seconds ago",
    icon: Activity,
    color: "blue",
  },
  {
    id: "diagnosis",
    name: "Diagnosis Agent",
    status: "active",
    currentTask: "Predicting brake failure for VH-003",
    tasksCompleted: 892,
    successRate: 96.2,
    lastActivity: "5 seconds ago",
    icon: Brain,
    color: "purple",
  },
  {
    id: "customer-engagement",
    name: "Customer Engagement Agent",
    status: "active",
    currentTask: "Voice call with Rajesh Kumar",
    tasksCompleted: 456,
    successRate: 94.8,
    lastActivity: "10 seconds ago",
    icon: MessageSquare,
    color: "green",
  },
  {
    id: "scheduling",
    name: "Scheduling Agent",
    status: "active",
    currentTask: "Optimizing appointment slots",
    tasksCompleted: 678,
    successRate: 97.1,
    lastActivity: "8 seconds ago",
    icon: Calendar,
    color: "orange",
  },
  {
    id: "feedback",
    name: "Feedback Agent",
    status: "idle",
    currentTask: "Waiting for service completion",
    tasksCompleted: 234,
    successRate: 95.5,
    lastActivity: "2 minutes ago",
    icon: Users,
    color: "teal",
  },
  {
    id: "manufacturing",
    name: "Manufacturing Quality Insights",
    status: "active",
    currentTask: "Analyzing RCA/CAPA patterns",
    tasksCompleted: 189,
    successRate: 99.1,
    lastActivity: "15 seconds ago",
    icon: FileText,
    color: "indigo",
  },
]

const mockActivities: AgentActivity[] = [
  {
    id: "1",
    timestamp: "Just now",
    agent: "Master Agent",
    action: "Orchestrated diagnosis → customer engagement",
    status: "success",
    details: "Coordinated 3 worker agents for VH-001 brake issue",
  },
  {
    id: "2",
    timestamp: "5s ago",
    agent: "Data Analysis Agent",
    action: "Detected anomaly in telematics",
    status: "warning",
    details: "Engine temperature spike detected in VH-003",
  },
  {
    id: "3",
    timestamp: "12s ago",
    agent: "Customer Engagement Agent",
    action: "Voice call initiated",
    status: "success",
    details: "Successfully contacted Rajesh Kumar about scheduled service",
  },
  {
    id: "4",
    timestamp: "18s ago",
    agent: "Scheduling Agent",
    action: "Appointment confirmed",
    status: "success",
    details: "Booked slot for VH-001 at 2:00 PM tomorrow",
  },
  {
    id: "5",
    timestamp: "25s ago",
    agent: "Diagnosis Agent",
    action: "Failure prediction generated",
    status: "success",
    details: "Brake pad wear critical - 95% confidence",
  },
]

function AgenticAIContent() {
  const [masterAgentStatus, setMasterAgentStatus] = useState<"running" | "paused">("running")
  const [activities, setActivities] = useState<AgentActivity[]>(mockActivities)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  useEffect(() => {
    if (masterAgentStatus === "running") {
      const interval = setInterval(() => {
        // Simulate new activity
        const newActivity: AgentActivity = {
          id: Date.now().toString(),
          timestamp: "Just now",
          agent: workerAgents[Math.floor(Math.random() * workerAgents.length)].name,
          action: "Processing task",
          status: "success",
          details: "Task completed successfully",
        }
        setActivities(prev => [newActivity, ...prev.slice(0, 19)])
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [masterAgentStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-300"
      case "idle":
        return "bg-gray-100 text-gray-700 border-gray-300"
      case "error":
        return "bg-red-100 text-red-700 border-red-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700"
      case "warning":
        return "bg-yellow-100 text-yellow-700"
      case "error":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const totalTasks = workerAgents.reduce((sum, agent) => sum + agent.tasksCompleted, 0)
  const avgSuccessRate = workerAgents.reduce((sum, agent) => sum + agent.successRate, 0) / workerAgents.length

  return (
    <div className="flex h-screen bg-gray-50">
      <ServiceCenterSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ServiceCenterHeader />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Agentic AI Control Center</h1>
                  <p className="text-sm text-gray-600">Master Agent orchestration and Worker Agent monitoring</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${masterAgentStatus === "running" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"} border text-sm px-4 py-1.5 flex items-center gap-2`}>
                    <div className={`w-2 h-2 rounded-full ${masterAgentStatus === "running" ? "bg-green-600 animate-pulse" : "bg-gray-400"}`}></div>
                    Master Agent {masterAgentStatus === "running" ? "Running" : "Paused"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMasterAgentStatus(masterAgentStatus === "running" ? "paused" : "running")}
                  >
                    {masterAgentStatus === "running" ? (
                      <>
                        <Pause size={16} className="mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Master Agent Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Brain size={18} className="text-purple-600" />
                    Master Agent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">Orchestrating</div>
                  <div className="text-xs text-gray-600">6 Worker Agents Active</div>
                  <div className="mt-3">
                    <Progress value={95} className="h-2" />
                    <div className="text-xs text-gray-600 mt-1">95% System Health</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Activity size={18} className="text-blue-600" />
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{totalTasks.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Completed Today</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-600" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{avgSuccessRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Average Across Agents</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Shield size={18} className="text-orange-600" />
                    UEBA Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-1">Secure</div>
                  <div className="text-xs text-gray-600">0 Anomalies Detected</div>
                </CardContent>
              </Card>
            </div>

            {/* Worker Agents Dashboard */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Worker Agents Status</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {workerAgents.map((agent) => {
                  const Icon = agent.icon
                  return (
                    <Card
                      key={agent.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAgent === agent.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <div className={`p-2 rounded-lg bg-${agent.color}-100`}>
                              <Icon size={16} className={`text-${agent.color}-600`} />
                            </div>
                            {agent.name}
                          </CardTitle>
                          <Badge className={`text-xs ${getStatusColor(agent.status)}`}>
                            {agent.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Current Task</p>
                            <p className="text-sm font-medium text-gray-900">{agent.currentTask}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-600">Tasks</p>
                              <p className="text-sm font-bold text-gray-900">{agent.tasksCompleted}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Success Rate</p>
                              <p className="text-sm font-bold text-green-600">{agent.successRate}%</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Last Activity: {agent.lastActivity}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Real-time Activity Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity size={20} className="text-blue-600" />
                    Real-time Agent Activity Log
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <RotateCcw size={14} className="mr-2" />
                    Clear Log
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <div className={`p-1.5 rounded-lg ${getActivityStatusColor(activity.status)}`}>
                          {activity.status === "success" && <CheckCircle2 size={14} />}
                          {activity.status === "warning" && <AlertCircle size={14} />}
                          {activity.status === "error" && <AlertCircle size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">{activity.agent}</span>
                            <Badge className={`text-xs ${getActivityStatusColor(activity.status)}`}>
                              {activity.status}
                            </Badge>
                            <span className="text-xs text-gray-500 ml-auto">{activity.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Override Controls */}
            <Card className="mt-6 border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings size={20} className="text-orange-600" />
                  Manager Override Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Pause size={16} className="mr-2" />
                    Pause All Agents
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Zap size={16} className="mr-2" />
                    Force Task Reassignment
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Shield size={16} className="mr-2" />
                    Trigger UEBA Audit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AgenticAIPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <AgenticAIContent />
    </Suspense>
  )
}

