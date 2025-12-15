"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const maintenanceData = [
  { month: "Jan 23", total: 2980 },
  { month: "Feb 23", total: 3050 },
  { month: "Mar 23", total: 3100 },
  { month: "Apr 23", total: 3035 },
  { month: "May 23", total: 3105 },
  { month: "Jun 23", total: 3216.73 },
  { month: "Jul 23", total: 3155 },
  { month: "Aug 23", total: 3180 },
  { month: "Sep 23", total: 3215 },
  { month: "Oct 23", total: 3240 },
  { month: "Nov 23", total: 3285 },
  { month: "Dec 23", total: 3305 },
]

const juneDetails = [
  { name: "Oil Change", value: 275.43, change: -2.9, color: "#ef4444", trend: "down" },
  { name: "Fluid", value: 396.84, change: 16.5, color: "#10b981", trend: "up" },
  { name: "Battery", value: 943.65, change: 5.7, color: "#fbbf24", trend: "up" },
  { name: "Belt & Hose", value: 767.50, change: 71.2, color: "#3b82f6", trend: "up" },
  { name: "Suspension", value: 630.44, change: -34, color: "#8b5cf6", trend: "down" },
  { name: "Lighting", value: 202.87, change: 78.5, color: "#ec4899", trend: "up" },
]

export default function MaintenanceOverview() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chart Section - 2 columns */}
      <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-gray-800">Maintenance overview</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === "monthly" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={period === "yearly" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setPeriod("yearly")}
            >
              Yearly
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  domain={[0, 4000]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "11px",
                    padding: "8px"
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar 
                  dataKey="total" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* June 2023 Details - 1 column */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-800">June 2023</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {juneDetails.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-600 truncate">{item.name}:</span>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs font-medium text-gray-900">${item.value.toFixed(2)}</span>
                  <div className={`flex items-center gap-0.5 ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {item.trend === "up" ? (
                      <TrendingUp size={10} />
                    ) : (
                      <TrendingDown size={10} />
                    )}
                    <span className="text-[10px] font-medium">
                      {item.change > 0 ? "+" : ""}{item.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

