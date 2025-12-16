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
import LearningLoopMetrics from "@/components/service-center/learning-loop-metrics"
import AIControlCentre from "@/components/service-center/ai-control-centre"

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
                  <Badge className={`${masterAgentStatus === "running" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"} border-2 text-sm px-4 py-1.5 flex items-center gap-2`}>
                    <div className={`w-2 h-2 rounded-full ${masterAgentStatus === "running" ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}></div>
                    Master Agent {masterAgentStatus === "running" ? "Running" : "Paused"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMasterAgentStatus(masterAgentStatus === "running" ? "paused" : "running")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
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
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Master Agent Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card className="relative bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                <CardHeader className="pb-3 bg-white/50">
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg border border-purple-200">
                      <Brain size={18} className="text-purple-700" />
                    </div>
                    Master Agent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">Orchestrating</div>
                  <div className="text-xs text-gray-700 mb-3 font-medium">6 Worker Agents Active</div>
                  <div className="mt-3">
                    <Progress value={95} className="h-2.5 bg-purple-100" />
                    <div className="text-xs text-gray-700 mt-1.5 font-semibold">95% System Health</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                <CardHeader className="pb-3 bg-white/50">
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
                      <Activity size={18} className="text-blue-700" />
                    </div>
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{totalTasks.toLocaleString()}</div>
                  <div className="text-xs text-gray-700 font-medium">Completed Today</div>
                </CardContent>
              </Card>

              <Card className="relative bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                <CardHeader className="pb-3 bg-white/50">
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg border border-green-200">
                      <TrendingUp size={18} className="text-green-700" />
                    </div>
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{avgSuccessRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-700 font-medium">Average Across Agents</div>
                </CardContent>
              </Card>

              <Card className="relative bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                <CardHeader className="pb-3 bg-white/50">
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg border border-orange-200">
                      <Shield size={18} className="text-orange-700" />
                    </div>
                    UEBA Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700 mb-1">Secure</div>
                  <div className="text-xs text-gray-700 font-medium">0 Anomalies Detected</div>
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
                      className={`relative cursor-pointer transition-all hover:shadow-lg overflow-hidden ${
                        selectedAgent === agent.id ? "ring-2 ring-blue-500 shadow-lg" : ""
                      } bg-white border border-gray-200`}
                      onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <div className={`p-2 rounded-lg border ${
                              agent.color === "blue" ? "bg-blue-100 border-blue-200" :
                              agent.color === "purple" ? "bg-purple-100 border-purple-200" :
                              agent.color === "green" ? "bg-green-100 border-green-200" :
                              agent.color === "orange" ? "bg-orange-100 border-orange-200" :
                              agent.color === "teal" ? "bg-teal-100 border-teal-200" :
                              "bg-indigo-100 border-indigo-200"
                            }`}>
                              <Icon size={16} className={
                                agent.color === "blue" ? "text-blue-700" :
                                agent.color === "purple" ? "text-purple-700" :
                                agent.color === "green" ? "text-green-700" :
                                agent.color === "orange" ? "text-orange-700" :
                                agent.color === "teal" ? "text-teal-700" :
                                "text-indigo-700"
                              } />
                            </div>
                            {agent.name}
                          </CardTitle>
                          <Badge className={`text-xs border ${
                            agent.status === "active" ? "bg-green-100 text-green-700 border-green-300" :
                            agent.status === "idle" ? "bg-gray-100 text-gray-700 border-gray-300" :
                            "bg-red-100 text-red-700 border-red-300"
                          }`}>
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
              <Card className="lg:col-span-2 relative bg-white border border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity size={20} className="text-blue-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Real-time Agent Activity Log</CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">Live monitoring of agent operations</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400">
                    <RotateCcw size={14} className="mr-2" />
                    Clear Log
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="group flex items-start gap-3 p-3.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50/80 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className={`p-2.5 rounded-lg border-2 flex-shrink-0 shadow-sm ${
                          activity.status === "success" ? "bg-green-50 text-green-700 border-green-300" :
                          activity.status === "warning" ? "bg-yellow-50 text-yellow-700 border-yellow-300" :
                          "bg-red-50 text-red-700 border-red-300"
                        }`}>
                          {activity.status === "success" && <CheckCircle2 size={18} />}
                          {activity.status === "warning" && <AlertCircle size={18} />}
                          {activity.status === "error" && <AlertCircle size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">{activity.agent}</span>
                            <Badge className={`text-xs border font-medium px-2 py-0.5 ${
                              activity.status === "success" ? "bg-green-50 text-green-700 border-green-300" :
                              activity.status === "warning" ? "bg-yellow-50 text-yellow-700 border-yellow-300" :
                              "bg-red-50 text-red-700 border-red-300"
                            }`}>
                              {activity.status}
                            </Badge>
                            <span className="text-xs text-gray-500 ml-auto font-medium flex items-center gap-1">
                              <Clock size={12} />
                              {activity.timestamp}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 mb-1.5">{activity.action}</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{activity.details}</p>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <Activity size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No activity logs yet</p>
                        <p className="text-xs mt-1">Agent activities will appear here in real-time</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Control Centre - 8x8 Grid */}
            <div className="mt-6">
              <AIControlCentre />
            </div>

            {/* Learning Loop Metrics */}
            <div className="mt-6">
              <LearningLoopMetrics />
            </div>

            {/* Override Controls */}
            <Card className="mt-6 relative bg-white border border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings size={20} className="text-orange-600" />
                  Manager Override Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start border-gray-300 text-gray-700 hover:bg-gray-100">
                    <Pause size={16} className="mr-2" />
                    Pause All Agents
                  </Button>
                  <Button variant="outline" className="justify-start border-gray-300 text-gray-700 hover:bg-gray-100">
                    <Zap size={16} className="mr-2" />
                    Force Task Reassignment
                  </Button>
                  <Button variant="outline" className="justify-start border-gray-300 text-gray-700 hover:bg-gray-100">
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

