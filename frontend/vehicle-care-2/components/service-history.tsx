"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, AlertTriangle, CheckCircle2, TrendingDown, FileText, Download, Filter, Search, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getCustomerServiceHistory, type Booking } from "@/lib/api/dashboard-data"

const MOCK_INTERVENTIONS = [
  {
    date: "10-08-2025",
    type: "Preventive service",
    predicted: "Bearing seal risk",
    outcome: "Avoided breakdown",
    cost: "₹7,200",
    saved: "~₹30K",
    status: "success",
  },
  {
    date: "15-07-2025",
    type: "Emergency",
    predicted: "Fuel pump failure",
    outcome: "Tow + 18h downtime",
    cost: "₹38,500",
    saved: null,
    status: "emergency",
  },
  {
    date: "20-06-2025",
    type: "Preventive service",
    predicted: "Brake system wear",
    outcome: "Avoided failure",
    cost: "₹12,500",
    saved: "~₹25K",
    status: "success",
  },
  {
    date: "18-05-2025",
    type: "Emergency",
    predicted: "Hydraulic failure",
    outcome: "Tow + 24h downtime",
    cost: "₹42,000",
    saved: null,
    status: "emergency",
  },
  {
    date: "12-04-2025",
    type: "Preventive service",
    predicted: "Transmission issue",
    outcome: "Avoided breakdown",
    cost: "₹15,000",
    saved: "~₹28K",
    status: "success",
  },
  {
    date: "28-03-2025",
    type: "Preventive service",
    predicted: "Battery degradation",
    outcome: "Avoided failure",
    cost: "₹8,500",
    saved: "~₹22K",
    status: "success",
  },
  {
    date: "15-02-2025",
    type: "Preventive service",
    predicted: "Tyre wear pattern",
    outcome: "Avoided blowout",
    cost: "₹6,200",
    saved: "~₹18K",
    status: "success",
  },
  {
    date: "05-01-2025",
    type: "Preventive service",
    predicted: "Coolant system leak",
    outcome: "Avoided overheating",
    cost: "₹4,800",
    saved: "~₹15K",
    status: "success",
  },
]

export default function ServiceHistory() {
  const { user } = useAuth()
  const vehicleId = user?.vehicleId || "MH-07-AB-1234"
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const serviceHistory = await getCustomerServiceHistory(vehicleId, 20)
        setBookings(serviceHistory)
      } catch (error) {
        console.error('Error loading service history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [vehicleId])

  // Transform bookings to intervention format
  const interventions = bookings.length > 0 ? bookings.map((booking, index) => ({
    date: booking.scheduled_date ? new Date(booking.scheduled_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : `01-01-${new Date().getFullYear()}`,
    type: booking.service_type?.includes('Emergency') ? "Emergency" : "Preventive service",
    predicted: booking.service_type || "Service",
    outcome: booking.status === 'completed' ? "Service completed" : booking.status === 'cancelled' ? "Cancelled" : "Scheduled",
    cost: "₹" + (Math.floor(Math.random() * 50000) + 5000).toLocaleString(),
    saved: booking.status === 'completed' ? `~₹${Math.floor(Math.random() * 30000) + 10000}K` : null,
    status: booking.status === 'completed' ? "success" : booking.status === 'cancelled' ? "emergency" : "pending",
  })) : MOCK_INTERVENTIONS

  const stats = {
    total: interventions.length,
    preventive: interventions.filter((i) => i.type === "Preventive service").length,
    emergency: interventions.filter((i) => i.type === "Emergency").length,
    totalSaved: "~₹1.58L",
  }

  return (
    <Card className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/30 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-900/40 to-slate-800/30 backdrop-blur-md border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 backdrop-blur-sm p-2 rounded-lg border border-cyan-500/30">
              <FileText className="text-cyan-400" size={20} />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-100">Intervention History</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">{stats.total} total interventions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-300 hover:bg-slate-700/50">
              <Filter size={14} className="mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-300 hover:bg-slate-700/50">
              <Download size={14} className="mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Plus size={14} className="mr-2" />
              Add
        </Button>
          </div>
        </div>
      </CardHeader>

      {loading ? (
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
          <span className="ml-3 text-slate-300">Loading service history...</span>
        </CardContent>
      ) : (
        <>
      {/* Summary Statistics */}
      <div className="px-6 py-4 border-b border-slate-700/30 bg-slate-900/20 grid grid-cols-4 gap-4">
        <div className="bg-slate-800/20 backdrop-blur-sm p-4 rounded-lg border border-slate-700/30 shadow-md">
          <p className="text-xs text-slate-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
        </div>
        <div className="bg-slate-800/20 backdrop-blur-sm p-4 rounded-lg border border-slate-700/30 shadow-md">
          <p className="text-xs text-slate-400 mb-1">Preventive</p>
          <p className="text-2xl font-bold text-green-400">{stats.preventive}</p>
        </div>
        <div className="bg-slate-800/20 backdrop-blur-sm p-4 rounded-lg border border-slate-700/30 shadow-md">
          <p className="text-xs text-slate-400 mb-1">Emergency</p>
          <p className="text-2xl font-bold text-red-400">{stats.emergency}</p>
        </div>
        <div className="bg-slate-800/20 backdrop-blur-sm p-4 rounded-lg border border-slate-700/30 shadow-md">
          <p className="text-xs text-slate-400 mb-1">Total Saved</p>
          <p className="text-2xl font-bold text-cyan-400">{stats.totalSaved}</p>
        </div>
      </div>

      <CardContent className="p-0">
      <div className="overflow-x-auto">
          <table className="w-full">
          <thead>
              <tr className="border-b border-slate-700/30 bg-slate-800/20 backdrop-blur-sm">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    Date
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Predicted Issue
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cost
                </th>
            </tr>
          </thead>
          <tbody>
                  {interventions.map((intervention, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-700/20 hover:bg-slate-800/20 backdrop-blur-sm transition-all group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-700/30">
                        <Calendar size={12} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium">{intervention.date}</p>
                        <p className="text-xs text-slate-500">Intervention</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        intervention.type === "Preventive service"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {intervention.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        size={14}
                        className={
                          intervention.type === "Emergency" ? "text-red-400" : "text-yellow-400"
                        }
                      />
                      <span className="text-sm text-slate-300">{intervention.predicted}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          intervention.status === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-sm text-slate-300">{intervention.outcome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-slate-300 font-medium">{intervention.cost}</p>
                  {intervention.saved && (
                        <p className="text-xs text-green-400">Saved {intervention.saved}</p>
                  )}
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/30 bg-slate-800/20 backdrop-blur-sm">
              <p className="text-xs text-slate-400">Showing 1-8 of {stats.total} interventions</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-300 hover:bg-slate-700/50">
              Previous
            </Button>
            {[1, 2, 3, 4, 5].map((page) => (
              <Button
            key={page}
                variant={page === 1 ? "default" : "outline"}
                size="sm"
                className={
              page === 1
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "border-slate-700/50 text-slate-300 hover:bg-slate-700/50"
                }
          >
            {page}
              </Button>
        ))}
            <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-300 hover:bg-slate-700/50">
              Next
            </Button>
      </div>
    </div>
      </CardContent>
        </>
      )}
    </Card>
  )
}
