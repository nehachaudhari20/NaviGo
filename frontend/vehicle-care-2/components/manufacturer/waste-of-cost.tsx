"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const costData = [
  { month: "Jan", cost: 250000 },
  { month: "Feb", cost: 280000 },
  { month: "Mar", cost: 300000 },
  { month: "Apr", cost: 320000 },
  { month: "May", cost: 350000 },
  { month: "Jun", cost: 380000 },
  { month: "Jul", cost: 410000 },
  { month: "Aug", cost: 410359 },
  { month: "Sep", cost: 390000 },
  { month: "Oct", cost: 370000 },
  { month: "Nov", cost: 340000 },
  { month: "Dec", cost: 320000 },
]

export default function WasteOfCost() {
  return (
    <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
      <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-3 backdrop-blur-md bg-white/5 border-b border-white/10">
        <CardTitle className="text-white text-lg">Waste of Cost</CardTitle>
        <Select defaultValue="monthly">
          <SelectTrigger className="w-32 bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white/10 backdrop-blur-2xl border-white/10">
            <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
            <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
            <SelectItem value="daily" className="text-white">Daily</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="relative z-10">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={{ stroke: "#374151" }}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={{ stroke: "#374151" }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ fill: "#06b6d4", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Peak waste cost: $410,359 in August
        </div>
      </CardContent>
    </Card>
  )
}

