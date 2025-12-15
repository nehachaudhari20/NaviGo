"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Wind } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"

interface TyreSectionProps {
  tyrePressureData: Array<{ day: string; FL: number; FR: number; RL: number; RR: number }>
}

export default function TyreSection({ tyrePressureData }: TyreSectionProps) {
  const tyres = [
    { pos: "FL", label: "Front Left", pressure: 2.2, temp: 42, wear: 64, status: "good" },
    { pos: "FR", label: "Front Right", pressure: 2.2, temp: 43, wear: 62, status: "good" },
    { pos: "RL", label: "Rear Left", pressure: 2.1, temp: 41, wear: 68, status: "warning" },
    { pos: "RR", label: "Rear Right", pressure: 2.2, temp: 42, wear: 66, status: "good" },
  ]

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardHeader>
        <CardTitle className="text-2xl text-cyan-400 flex items-center gap-2">
          <Wind className="text-cyan-400" size={24} />
          Tyre Health & Pressure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-5">
          {tyres.map((tyre) => (
            <div key={tyre.pos} className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg p-5 text-center shadow-md">
              <div className="text-cyan-400 font-semibold mb-4">{tyre.pos} - {tyre.label}</div>
              <div
                className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-semibold text-white ${
                  tyre.status === "good" ? "bg-green-500/30 border-2 border-green-500" : "bg-yellow-500/30 border-2 border-yellow-500"
                }`}
              >
                {tyre.wear}%
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-slate-400 text-xs uppercase mb-1">Pressure</div>
                  <div className="font-semibold">{tyre.pressure} bar {tyre.status === "good" ? "✓" : "⚠️"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs uppercase mb-1">Temperature</div>
                  <div className="font-semibold">{tyre.temp}°C ✓</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg p-5 shadow-md">
          <div className="text-center text-slate-300 font-semibold text-sm mb-4">Tyre Pressure Stability (Last 30 Days)</div>
          <ChartContainer
            config={{
              FL: { label: "FL", color: "hsl(199, 89%, 48%)" },
              FR: { label: "FR", color: "hsl(142, 76%, 36%)" },
              RL: { label: "RL - Pressure Drop ⚠️", color: "hsl(43, 96%, 56%)" },
              RR: { label: "RR", color: "hsl(262, 83%, 58%)" },
            }}
            className="h-[300px]"
          >
            <LineChart data={tyrePressureData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: "#94a3b8" }} />
              <YAxis className="text-xs" tick={{ fill: "#94a3b8" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="FL" stroke="hsl(199, 89%, 48%)" strokeWidth={2} />
              <Line type="monotone" dataKey="FR" stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
              <Line type="monotone" dataKey="RL" stroke="hsl(43, 96%, 56%)" strokeWidth={2} />
              <Line type="monotone" dataKey="RR" stroke="hsl(262, 83%, 58%)" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            Monitor RL Pressure
          </div>
          <div className="text-yellow-200 text-sm">
            Rear Left tyre showing gradual pressure drop (2.20 → 2.10 bar over 30 days). Possible slow leak or natural pressure loss. Schedule inspection within 2 weeks.
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600">Schedule Tyre Rotation</Button>
          <Button variant="outline" className="border-slate-600">RL Inspection</Button>
        </div>
      </CardContent>
    </Card>
  )
}

