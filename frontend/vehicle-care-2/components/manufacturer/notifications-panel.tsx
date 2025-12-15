"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertCircle, CheckCircle2, Info, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

const notifications = [
  {
    id: 1,
    type: "alert",
    title: "Production Line 2 Alert",
    message: "Temperature threshold exceeded. Immediate attention required.",
    time: "2 minutes ago",
    unread: true,
    priority: "high",
    icon: AlertCircle,
    color: "red",
  },
  {
    id: 2,
    type: "success",
    title: "Quality Check Passed",
    message: "Batch #1245 passed all quality checks. Ready for shipment.",
    time: "15 minutes ago",
    unread: true,
    priority: "medium",
    icon: CheckCircle2,
    color: "green",
  },
  {
    id: 3,
    type: "info",
    title: "Inventory Low",
    message: "Component stock for Line 3 is below recommended level.",
    time: "1 hour ago",
    unread: true,
    priority: "medium",
    icon: Info,
    color: "yellow",
  },
  {
    id: 4,
    type: "success",
    title: "Order Fulfilled",
    message: "Order #1246 has been completed and shipped.",
    time: "2 hours ago",
    unread: false,
    priority: "low",
    icon: CheckCircle2,
    color: "green",
  },
  {
    id: 5,
    type: "alert",
    title: "Maintenance Due",
    message: "Scheduled maintenance for Line 1 is due in 4 hours.",
    time: "3 hours ago",
    unread: false,
    priority: "medium",
    icon: AlertCircle,
    color: "yellow",
  },
]

export default function NotificationsPanel() {
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all")
  const [notifs, setNotifs] = useState(notifications)

  const filteredNotifications = notifs.filter((notif) => {
    if (filter === "unread") return notif.unread
    if (filter === "high") return notif.priority === "high"
    return true
  })

  const unreadCount = notifs.filter((n) => n.unread).length

  const markAsRead = (id: number) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  }

  const deleteNotification = (id: number) => {
    setNotifs(notifs.filter((n) => n.id !== id))
  }

  return (
    <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
      <CardHeader className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg border border-cyan-500/30">
              <Bell className="text-cyan-400" size={20} />
            </div>
            <CardTitle className="text-white text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-cyan-500 text-white text-xs ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10 border border-white/10"
              onClick={() => setFilter(filter === "all" ? "unread" : filter === "unread" ? "high" : "all")}
            >
              <Filter size={14} className="text-gray-300" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 p-0">
        <div className="max-h-[500px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon
                const colorClasses = {
                  red: "text-red-400 bg-red-500/20 border-red-500/30",
                  green: "text-green-400 bg-green-500/20 border-green-500/30",
                  yellow: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
                  blue: "text-blue-400 bg-blue-500/20 border-blue-500/30",
                }
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors ${
                      notification.unread ? "bg-white/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border flex-shrink-0 ${
                        colorClasses[notification.color as keyof typeof colorClasses]
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-white">
                                {notification.title}
                              </h4>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {notification.time}
                              </span>
                              <Badge
                                className={`text-xs ${
                                  notification.priority === "high"
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : notification.priority === "medium"
                                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                }`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {notification.unread && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-white/10"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle2 size={12} className="text-gray-400" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-white/10"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X size={12} className="text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

