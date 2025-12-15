"use client"

import { useState } from "react"
import { Suspense } from "react"
import ServiceCenterSidebar from "@/components/service-center/sidebar"
import ServiceCenterHeader from "@/components/service-center/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  Phone, 
  CheckCircle2, 
  XCircle,
  Clock,
  TrendingUp,
  User,
  Mic,
  Volume2,
  AlertCircle,
  Send
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface VoiceConversation {
  id: string
  customer: string
  vehicle: string
  type: "outbound" | "inbound"
  status: "completed" | "in-progress" | "failed"
  duration: string
  timestamp: string
  outcome: "scheduled" | "declined" | "callback" | "no-answer"
  aiScore: number
  transcript: { speaker: string; text: string }[]
  followUpRequired: boolean
}

interface EngagementMetric {
  label: string
  value: string
  change: string
  trend: "up" | "down"
}

const conversations: VoiceConversation[] = [
  {
    id: "VC-001",
    customer: "Rajesh Kumar",
    vehicle: "Tata Nexon",
    type: "outbound",
    status: "completed",
    duration: "4m 32s",
    timestamp: "2 hours ago",
    outcome: "scheduled",
    aiScore: 95,
    transcript: [
      { speaker: "AI Agent", text: "Hello, this is DriveAI Protect calling about your Tata Nexon. We've detected a potential brake issue that needs attention." },
      { speaker: "Customer", text: "Oh, really? When should I bring it in?" },
      { speaker: "AI Agent", text: "Based on our analysis, we recommend scheduling within the next 2-3 days. We have slots available tomorrow at 2 PM or the day after at 10 AM." },
      { speaker: "Customer", text: "Tomorrow at 2 PM works for me." },
      { speaker: "AI Agent", text: "Perfect! I've scheduled your appointment for tomorrow at 2 PM. You'll receive a confirmation SMS shortly." },
    ],
    followUpRequired: false,
  },
  {
    id: "VC-002",
    customer: "Anita Sharma",
    vehicle: "Hyundai i20",
    type: "outbound",
    status: "completed",
    duration: "3m 15s",
    timestamp: "3 hours ago",
    outcome: "declined",
    aiScore: 78,
    transcript: [
      { speaker: "AI Agent", text: "Hello, this is DriveAI Protect. We've identified an engine service recommendation for your Hyundai i20." },
      { speaker: "Customer", text: "I'm quite busy right now. Can you call back next week?" },
      { speaker: "AI Agent", text: "Of course. I understand. However, this is a time-sensitive issue. Would you prefer a weekend appointment?" },
      { speaker: "Customer", text: "No, I'll call you when I'm ready. Thanks." },
    ],
    followUpRequired: true,
  },
  {
    id: "VC-003",
    customer: "Vikram Singh",
    vehicle: "Mahindra XUV",
    type: "outbound",
    status: "in-progress",
    duration: "2m 10s",
    timestamp: "Just now",
    outcome: "callback",
    aiScore: 88,
    transcript: [
      { speaker: "AI Agent", text: "Hello, this is DriveAI Protect calling about your Mahindra XUV battery replacement." },
      { speaker: "Customer", text: "Can you hold on? I need to check my calendar." },
    ],
    followUpRequired: false,
  },
]

const metrics: EngagementMetric[] = [
  { label: "Engagement Rate", value: "87.5%", change: "+5.2%", trend: "up" },
  { label: "Scheduling Success", value: "72.3%", change: "+3.1%", trend: "up" },
  { label: "Avg Call Duration", value: "3m 45s", change: "-12s", trend: "down" },
  { label: "Follow-up Required", value: "18", change: "-4", trend: "down" },
]

const manualInterventions = [
  {
    id: "MI-001",
    customer: "Anita Sharma",
    vehicle: "Hyundai i20",
    reason: "Customer declined - needs manual follow-up",
    priority: "high",
    assignedTo: "Unassigned",
    createdAt: "3 hours ago",
  },
  {
    id: "MI-002",
    customer: "Meera Patel",
    vehicle: "Maruti Swift",
    reason: "Complex service inquiry - requires human agent",
    priority: "medium",
    assignedTo: "Sarah M.",
    createdAt: "1 hour ago",
  },
]

function CustomerEngagementContent() {
  const [selectedConversation, setSelectedConversation] = useState<VoiceConversation | null>(null)
  const [filter, setFilter] = useState<"all" | "completed" | "in-progress" | "failed">("all")

  const filteredConversations = conversations.filter(c => 
    filter === "all" || c.status === filter
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <ServiceCenterSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ServiceCenterHeader />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Engagement Tracker</h1>
              <p className="text-sm text-gray-600">Voice agent conversations, customer responses, and engagement metrics</p>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {metrics.map((metric, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">{metric.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className={`text-xs flex items-center gap-1 ${
                      metric.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      <TrendingUp size={12} className={metric.trend === "down" ? "rotate-180" : ""} />
                      {metric.change}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Voice Agent Conversations */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900">Voice Agent Conversations</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                      >
                        All
                      </Button>
                      <Button
                        variant={filter === "completed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("completed")}
                      >
                        Completed
                      </Button>
                      <Button
                        variant={filter === "in-progress" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("in-progress")}
                      >
                        Active
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {filteredConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedConversation?.id === conv.id
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedConversation(conv)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-gray-900">{conv.customer}</h4>
                                <Badge className={`text-xs ${
                                  conv.status === "completed"
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : conv.status === "in-progress"
                                    ? "bg-blue-100 text-blue-700 border-blue-300"
                                    : "bg-red-100 text-red-700 border-red-300"
                                }`}>
                                  {conv.status}
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                                  AI {conv.aiScore}%
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{conv.vehicle}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Mic size={12} />
                                  {conv.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {conv.timestamp}
                                </span>
                                <Badge className={`text-xs ${
                                  conv.outcome === "scheduled"
                                    ? "bg-green-100 text-green-700"
                                    : conv.outcome === "declined"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  {conv.outcome}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {conv.followUpRequired && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-xs text-orange-600">
                                <AlertCircle size={12} />
                                Follow-up required
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conversation Details & Manual Intervention */}
              <div className="space-y-6">
                {selectedConversation ? (
                  <>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900">Conversation Transcript</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {selectedConversation.transcript.map((entry, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg ${
                                entry.speaker === "AI Agent"
                                  ? "bg-blue-50 border border-blue-200"
                                  : "bg-gray-50 border border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {entry.speaker === "AI Agent" ? (
                                  <Volume2 size={14} className="text-blue-600" />
                                ) : (
                                  <User size={14} className="text-gray-600" />
                                )}
                                <span className="text-xs font-semibold text-gray-900">{entry.speaker}</span>
                              </div>
                              <p className="text-sm text-gray-700">{entry.text}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900">Engagement Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Customer</p>
                            <p className="text-sm font-semibold text-gray-900">{selectedConversation.customer}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Vehicle</p>
                            <p className="text-sm font-medium text-gray-900">{selectedConversation.vehicle}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Outcome</p>
                            <Badge className={`text-xs ${
                              selectedConversation.outcome === "scheduled"
                                ? "bg-green-100 text-green-700"
                                : selectedConversation.outcome === "declined"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {selectedConversation.outcome}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">AI Performance Score</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${selectedConversation.aiScore}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-gray-900">{selectedConversation.aiScore}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center h-[300px] text-center">
                      <MessageSquare size={48} className="text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500">Select a conversation to view details</p>
                    </CardContent>
                  </Card>
                )}

                {/* Manual Intervention Queue */}
                <Card className="border-orange-200 bg-orange-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <AlertCircle size={18} className="text-orange-600" />
                      Manual Intervention Queue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {manualInterventions.map((intervention) => (
                        <div
                          key={intervention.id}
                          className="p-3 bg-white rounded-lg border border-orange-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-gray-900">{intervention.customer}</h5>
                              <p className="text-xs text-gray-600 mb-1">{intervention.vehicle}</p>
                              <p className="text-xs text-gray-700">{intervention.reason}</p>
                            </div>
                            <Badge className={`text-xs ${
                              intervention.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {intervention.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-500">Assigned: {intervention.assignedTo}</span>
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              Assign
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function CustomerEngagementPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <CustomerEngagementContent />
    </Suspense>
  )
}

