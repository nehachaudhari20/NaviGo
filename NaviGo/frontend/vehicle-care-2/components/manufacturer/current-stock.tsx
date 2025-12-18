"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUp, Package, CheckCircle2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const stockData = [
  { name: "Rim", value: 120 },
  { name: "Hub", value: 95 },
  { name: "Pedal", value: 80 },
  { name: "Chain", value: 110 },
  { name: "Brake", value: 85 },
  { name: "Tire", value: 148 },
  { name: "Seat", value: 70 },
  { name: "Gear", value: 100 },
  { name: "Frame", value: 90 },
  { name: "Spoke", value: 75 },
  { name: "Fork", value: 65 },
  { name: "Valve", value: 55 },
]

export default function CurrentStock() {
  return (
    <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
      <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-3 backdrop-blur-md bg-white/5 border-b border-white/10">
        <CardTitle className="text-white text-lg">Current Stock</CardTitle>
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
      <CardContent className="relative z-10 space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <span className="text-gray-300">Current Stock</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-300">Threshold</span>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="relative bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-cyan-500/30 hover:bg-white/8 transition-all group overflow-hidden">
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-cyan-500/20 backdrop-blur-md rounded-lg border border-cyan-500/40 shadow-lg">
                <ArrowUp className="text-cyan-400" size={16} />
              </div>
                <span className="text-xs text-gray-300 font-medium">Current Stock</span>
              </div>
              <p className="text-xl font-bold text-white drop-shadow-lg group-hover:text-cyan-400 transition-colors">5,200 units</p>
            </div>
          </div>
          <div className="relative bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-yellow-500/30 hover:bg-white/8 transition-all group overflow-hidden">
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-yellow-500/20 backdrop-blur-md rounded-lg border border-yellow-500/40 shadow-lg">
                  <Package className="text-yellow-500" size={16} />
                </div>
                <span className="text-xs text-gray-300 font-medium">Stock Replenished</span>
              </div>
              <p className="text-xl font-bold text-white drop-shadow-lg group-hover:text-yellow-400 transition-colors">7,800 units</p>
            </div>
          </div>
          <div className="relative bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-green-500/30 hover:bg-white/8 transition-all group overflow-hidden">
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-500/20 backdrop-blur-md rounded-lg border border-green-500/40 shadow-lg">
                  <CheckCircle2 className="text-green-500" size={16} />
                </div>
                <span className="text-xs text-gray-300 font-medium">Order Complete</span>
              </div>
              <p className="text-xl font-bold text-white drop-shadow-lg group-hover:text-green-400 transition-colors">3,400 units</p>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={{ stroke: "#374151" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={{ stroke: "#374151" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="value"
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Tire component shows 148 Unit above threshold
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

