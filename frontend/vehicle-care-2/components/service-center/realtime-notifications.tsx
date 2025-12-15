"use client"

import { useEffect, useState } from "react"
import { useWebSocket } from "@/lib/websocket"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  X,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Phone,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  type: "prediction" | "appointment" | "voice" | "feedback" | "learning" | "anomaly"
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: "high" | "medium" | "low"
  actionUrl?: string
}

export default function RealtimeNotifications() {
  const { connect, disconnect, on } = useWebSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    connect()

    // Listen for various events
    const unsubscribers = [
      on("prediction:new", (data: any) => {
        addNotification({
          id: `pred-${Date.now()}`,
          type: "prediction",
          title: "New Prediction Generated",
          message: `${data.component}: ${data.issueType} (${data.confidence}% confidence)`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: data.confidence >= 85 ? "high" : "medium",
          actionUrl: `/service-center/predictive-maintenance?predictionId=${data.id}`,
        })
      }),

      on("appointment:auto-scheduled", (data: any) => {
        addNotification({
          id: `apt-${Date.now()}`,
          type: "appointment",
          title: "Appointment Auto-Scheduled",
          message: `Service scheduled for ${data.vehicle} on ${new Date(data.scheduledAt).toLocaleDateString()}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: "medium",
          actionUrl: `/service-center/autonomous-scheduling?appointmentId=${data.id}`,
        })
      }),

      on("voice:call-started", (data: any) => {
        addNotification({
          id: `call-${Date.now()}`,
          type: "voice",
          title: "Voice Call Initiated",
          message: `Calling ${data.customer} about ${data.vehicle}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: "low",
          actionUrl: `/service-center/customer-engagement`,
        })
      }),

      on("service:feedback-received", (data: any) => {
        addNotification({
          id: `feedback-${Date.now()}`,
          type: "feedback",
          title: "Feedback Received",
          message: `Service feedback: ${data.accuracy}% accuracy for ${data.prediction}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: "low",
        })
      }),

      on("learning:model-updated", (data: any) => {
        addNotification({
          id: `learning-${Date.now()}`,
          type: "learning",
          title: "Model Retrained",
          message: `${data.modelName} accuracy improved to ${data.accuracy}%`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: "medium",
          actionUrl: `/service-center/agentic-ai`,
        })
      }),

      on("anomaly:detected", (data: any) => {
        addNotification({
          id: `anomaly-${Date.now()}`,
          type: "anomaly",
          title: "Anomaly Detected",
          message: `Anomaly detected in ${data.component} for ${data.vehicle}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: "high",
          actionUrl: `/service-center/predictive-maintenance?vehicleId=${data.vehicleId}`,
        })
      }),
    ]

    return () => {
      disconnect()
      unsubscribers.forEach(unsub => unsub())
    }
  }, [connect, disconnect, on])

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
    
    // Show browser notification if tab not focused
    if (document.hidden && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
        })
      }
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "prediction":
        return <AlertTriangle size={16} className="text-blue-500" />
      case "appointment":
        return <Calendar size={16} className="text-green-500" />
      case "voice":
        return <Phone size={16} className="text-purple-500" />
      case "feedback":
        return <CheckCircle2 size={16} className="text-yellow-500" />
      case "learning":
        return <TrendingUp size={16} className="text-cyan-500" />
      case "anomaly":
        return <AlertTriangle size={16} className="text-red-500" />
      default:
        return <Bell size={16} className="text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-gray-700" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge className="bg-blue-500 text-white text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X size={14} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-all cursor-pointer ${
                      !notification.read ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

