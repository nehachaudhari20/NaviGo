"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send,
  Bot,
  AlertCircle,
  TrendingUp,
  Phone,
  Mail
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Simulated service tracking data with AI follow-up
const activeServices = [
  {
    id: "SRV-001",
    vehicle: "Tata Nexon",
    customer: "Rajesh Kumar",
    service: "Full Service",
    status: "in_progress",
    progress: 65,
    startedAt: "2 hours ago",
    estimatedCompletion: "1 hour",
    technician: "Priya S.",
    aiFollowUp: {
      status: "scheduled",
      nextAction: "Send progress update",
      scheduledTime: "30 minutes",
      lastContact: "2 hours ago",
    },
  },
  {
    id: "SRV-002",
    vehicle: "Hyundai i20",
    customer: "Anita Sharma",
    service: "Brake Service",
    status: "in_progress",
    progress: 85,
    startedAt: "3 hours ago",
    estimatedCompletion: "30 minutes",
    technician: "Dev M.",
    aiFollowUp: {
      status: "pending",
      nextAction: "Request feedback",
      scheduledTime: "After completion",
      lastContact: "1 hour ago",
    },
  },
  {
    id: "SRV-003",
    vehicle: "Mahindra XUV",
    customer: "Vikram Singh",
    service: "Battery Replacement",
    status: "completed",
    progress: 100,
    completedAt: "30 minutes ago",
    technician: "Kumar R.",
    aiFollowUp: {
      status: "sent",
      nextAction: "Follow-up feedback",
      scheduledTime: "Now",
      lastContact: "Just now",
      feedbackRequested: true,
    },
  },
]

const aiFollowUpLog = [
  {
    id: "LOG-001",
    serviceId: "SRV-003",
    type: "feedback_request",
    message: "AI sent feedback request to customer",
    timestamp: "2 minutes ago",
    status: "sent",
    channel: "SMS",
  },
  {
    id: "LOG-002",
    serviceId: "SRV-001",
    type: "progress_update",
    message: "AI sent progress update (65% complete)",
    timestamp: "1 hour ago",
    status: "sent",
    channel: "Email",
  },
  {
    id: "LOG-003",
    serviceId: "SRV-002",
    type: "reminder",
    message: "AI scheduled completion reminder",
    timestamp: "2 hours ago",
    status: "scheduled",
    channel: "SMS",
  },
]

export default function AIServiceTracker() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs h-5">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-300 text-xs h-5">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs h-5">Pending</Badge>
      default:
        return null
    }
  }

  const getFollowUpStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-700 border-green-300 text-xs h-5">Sent</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs h-5">Scheduled</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs h-5">Pending</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Activity size={18} className="text-green-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              AI Service Progress Tracker
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Real-time tracking with AI follow-up</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
          <Bot size={12} className="mr-1" />
          AI Active
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Active Services with Progress */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity size={14} className="text-green-600" />
            Active Services
          </h4>
          <div className="space-y-3">
            {activeServices.map((service) => (
              <div
                key={service.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-semibold text-gray-900">{service.vehicle}</h5>
                      {getStatusBadge(service.status)}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{service.customer} • {service.service}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {service.status === "completed" ? `Completed ${service.completedAt}` : `Started ${service.startedAt}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity size={12} />
                        {service.technician}
                      </span>
                    </div>
                    {service.status === "in_progress" && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs font-semibold text-gray-900">{service.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${service.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Estimated completion: {service.estimatedCompletion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Follow-up Section */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot size={14} className="text-purple-600" />
                        <span className="text-xs font-medium text-gray-900">AI Follow-up</span>
                        {getFollowUpStatusBadge(service.aiFollowUp.status)}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{service.aiFollowUp.nextAction}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Scheduled: {service.aiFollowUp.scheduledTime}</span>
                        <span>Last contact: {service.aiFollowUp.lastContact}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="text-xs h-7">
                        <Send size={12} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs h-7">
                        <MessageSquare size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Follow-up Activity Log */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Bot size={14} className="text-purple-600" />
            AI Follow-up Activity Log
          </h4>
          <div className="space-y-2">
            {aiFollowUpLog.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Bot size={12} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium text-gray-900">{log.message}</p>
                    {getFollowUpStatusBadge(log.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      {log.channel === "SMS" ? <Phone size={10} /> : <Mail size={10} />}
                      {log.channel}
                    </span>
                    <span>{log.timestamp}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-mono text-gray-600">{log.serviceId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

