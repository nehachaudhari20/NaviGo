"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Users, Link2 } from "lucide-react"

const productionLines = [
  {
    status: "Active",
    icon: Settings,
    iconColor: "text-green-500",
    title: "Producing Cranksets",
    units: "12,500 units/day",
    hasImage: true,
  },
  {
    status: "Scheduled Maintenance",
    badge: "Maintenance",
    badgeColor: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    time: "2 hours",
    icon: Users,
    iconColor: "text-blue-500",
    title: "Maintenance Team",
    hasImage: true,
    showDetails: true,
  },
  {
    status: "Waiting for Material Delivery",
    badge: "Idle",
    badgeColor: "bg-gray-500/20 text-gray-500 border-gray-500/30",
    units: "0 units/day",
  },
  {
    status: "Active",
    icon: Link2,
    iconColor: "text-green-500",
    title: "Producing Chains",
    units: "7,300 units/day",
    hasImage: true,
  },
]

export default function ProductionLineStatus() {
  return (
    <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
      <CardHeader className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10">
        <CardTitle className="text-white text-lg">Production Line Status</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        {productionLines.map((line, index) => {
          const Icon = line.icon
          return (
            <div
              key={index}
              className="relative bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-[0_4px_16px_0_rgba(0,0,0,0.2)] flex items-center gap-4 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-40 pointer-events-none"></div>
              {line.hasImage && Icon && (
                <div className="relative z-10 w-16 h-16 bg-white/5 backdrop-blur-md rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
                  <Icon className={line.iconColor} size={32} />
                </div>
              )}
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className={
                      line.status === "Active"
                        ? "bg-green-500/20 text-green-500 border-green-500/30"
                        : line.badgeColor || "bg-gray-500/20 text-gray-500 border-gray-500/30"
                    }
                  >
                    {line.status === "Active" ? "Active" : line.badge}
                  </Badge>
                  {line.time && (
                    <span className="text-xs text-gray-400">{line.time}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-white">{line.title}</p>
                {line.units && <p className="text-xs text-gray-400 mt-1">{line.units}</p>}
              </div>
              {line.showDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  className="relative z-10 border-white/20 bg-white/5 backdrop-blur-sm text-gray-200 hover:bg-white/10 hover:border-white/30"
                >
                  Details
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

