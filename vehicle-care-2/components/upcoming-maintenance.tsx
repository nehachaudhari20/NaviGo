"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Wrench, DollarSign, MapPin, Clock, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function UpcomingMaintenance() {
  const maintenanceData = {
    lastService: {
      date: "27 Aug 2024",
      type: "Oil change & filter replacement",
    },
    totalServices: 16,
    upcoming: {
      title: "Oil Change",
      description: "Replacing the old engine oil and filter helps to keep the engine running smoothly and extend its lifespan.",
      daysRemaining: 5,
      dueDate: "Sep 15, 2024",
      estimatedCost: "₹800",
      provider: "AutoCare Center",
      progress: 85,
    },
  }

  return (
    <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700/50 shadow-xl">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          <Wrench className="text-cyan-400" size={22} />
          Maintenance Overview
        </CardTitle>
        <p className="text-sm text-slate-400 mt-1">Track service history and upcoming maintenance</p>
      </CardHeader>
      <CardContent className="p-6">
        {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Last Service Date */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 hover:border-cyan-500/30 transition-all">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <Calendar className="text-cyan-400" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Last Service Date</p>
                  <p className="text-2xl font-bold text-slate-100 mb-1">{maintenanceData.lastService.date}</p>
                  <p className="text-xs text-slate-400">{maintenanceData.lastService.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Services */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 hover:border-cyan-500/30 transition-all">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <Wrench className="text-yellow-400" size={24} />
                </div>
            <div className="flex-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Total Services</p>
                  <p className="text-2xl font-bold text-slate-100 mb-1">{maintenanceData.totalServices}</p>
                  <p className="text-xs text-slate-400">All preventive services</p>
            </div>
          </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Maintenance Card */}
        <Card className="bg-gradient-to-br from-cyan-500/10 via-slate-900/50 to-slate-800/80 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-400 border-cyan-500/30 px-3 py-1">
                    <AlertCircle size={14} className="mr-1.5" />
                    Upcoming Maintenance
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">{maintenanceData.upcoming.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{maintenanceData.upcoming.description}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 uppercase tracking-wide">Time Remaining</span>
                <span className="text-sm font-semibold text-cyan-400">{maintenanceData.upcoming.daysRemaining} days</span>
          </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all duration-500"
                  style={{ width: `${maintenanceData.upcoming.progress}%` }}
                />
        </div>
      </div>

            {/* Service Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700/50">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-green-400" size={16} />
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Estimated Cost</p>
                </div>
                <p className="text-lg font-bold text-slate-100">{maintenanceData.upcoming.estimatedCost}</p>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-blue-400" size={16} />
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Provider</p>
          </div>
                <p className="text-sm font-semibold text-slate-100">{maintenanceData.upcoming.provider}</p>
        </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-yellow-400" size={16} />
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Due Date</p>
          </div>
                <p className="text-sm font-semibold text-slate-100">{maintenanceData.upcoming.dueDate}</p>
          </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-purple-400" size={16} />
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Priority</p>
          </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs font-semibold">
                  High
                </Badge>
        </div>
      </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-slate-900 font-semibold shadow-lg shadow-cyan-500/20">
                Schedule Service
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                View Details
              </Button>
    </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
