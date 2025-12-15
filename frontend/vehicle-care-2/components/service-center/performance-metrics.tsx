"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PerformanceMetricsProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  type: "revenue" | "technician"
}

const revenueData = [
  { month: "Sep 22", value: 140000 },
  { month: "Oct 22", value: 145000 },
  { month: "Nov 22", value: 150000 },
  { month: "Dec 22", value: 148000 },
  { month: "Jan 23", value: 152000 },
  { month: "Feb 23", value: 150000 },
  { month: "Mar 23", value: 154000 },
  { month: "Apr 23", value: 153000 },
  { month: "May 23", value: 155000 },
  { month: "Jun 23", value: 154000 },
  { month: "Jul 23", value: 156000 },
  { month: "Aug 23", value: 156098 },
]

const technicianData = [
  { month: "Sep 22", value: 140000 },
  { month: "Oct 22", value: 145000 },
  { month: "Nov 22", value: 150000 },
  { month: "Dec 22", value: 148000 },
  { month: "Jan 23", value: 152000 },
  { month: "Feb 23", value: 150000 },
  { month: "Mar 23", value: 4940 },
  { month: "Apr 23", value: 153000 },
  { month: "May 23", value: 155000 },
  { month: "Jun 23", value: 154000 },
  { month: "Jul 23", value: 156000 },
  { month: "Aug 23", value: 156098 },
]

export default function PerformanceMetrics({ title, value, change, trend, type }: PerformanceMetricsProps) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly")
  const data = type === "revenue" ? revenueData : technicianData

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-gray-800">{title}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={period === "monthly" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={period === "yearly" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setPeriod("yearly")}
          >
            Yearly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <div className={`flex items-center gap-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="text-xs font-medium">{change}</span>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={type === "revenue" ? "#8b5cf6" : "#3b82f6"} stopOpacity={0.3}/>
                  <stop offset="100%" stopColor={type === "revenue" ? "#8b5cf6" : "#3b82f6"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#fff", 
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                fill={`url(#gradient-${type})`}
                stroke={type === "revenue" ? "#8b5cf6" : "#3b82f6"}
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

