"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Brain } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"

interface EngineComponentProps {
  engineTempData: Array<{ day: string; temp: number; baseline: number; threshold: number }>
}

export default function EngineComponent({ engineTempData }: EngineComponentProps) {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">🔧 Engine</h3>
            <p className="text-slate-400 text-sm mt-1">4-Cylinder EV Charger</p>
          </div>
          <Badge className="bg-green-500/20 text-green-500">84/100</Badge>
        </div>

        <div>
          <div className="text-slate-400 text-xs mb-2">Health Status</div>
          <div className="w-full h-8 bg-slate-900/30 backdrop-blur-sm rounded-full overflow-hidden border border-slate-700/30">
            <div className="h-full bg-gradient-to-r from-green-500 to-lime-500 flex items-center justify-end pr-3 text-white text-xs font-semibold" style={{ width: "84%" }}>
              84%
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            Temperature Alert
          </div>
          <div className="text-yellow-200 text-sm">
            Current: 91°C (Baseline: 82°C) - +9°C above normal. Coolant level at 95% (normal: 100%)
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Temperature", value: "91°C", status: "warning", desc: "⚠️ +9°C above baseline" },
            { label: "Oil Pressure", value: "2.8 bar", status: "ok", desc: "✓ Normal (2.5-3.0)" },
            { label: "Coolant Level", value: "95%", status: "warning", desc: "⚠️ Low (normal: 100%)" },
            { label: "Deterioration", value: "+2.3°C/day", status: "warning", desc: "⚠️ Trending up" },
          ].map((metric, i) => (
            <div key={i} className="bg-slate-900/30 backdrop-blur-sm p-4 rounded-lg border-l-4 border-cyan-500 shadow-md">
              <div className="text-slate-400 text-xs uppercase mb-1">{metric.label}</div>
              <div className="text-xl font-semibold">{metric.value}</div>
              <div className={`text-xs mt-1 ${metric.status === "ok" ? "text-green-500" : "text-yellow-500"}`}>
                {metric.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg p-5 shadow-md">
          <div className="text-center text-slate-300 font-semibold text-sm mb-4">Temperature Trend (Last 30 Days)</div>
          <ChartContainer
            config={{
              temp: { label: "Current Temp", color: "hsl(199, 89%, 48%)" },
              baseline: { label: "Baseline (Normal)", color: "hsl(142, 76%, 36%)" },
              threshold: { label: "Safe Threshold", color: "hsl(43, 96%, 56%)" },
            }}
            className="h-[300px]"
          >
            <LineChart data={engineTempData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: "#94a3b8" }} />
              <YAxis className="text-xs" tick={{ fill: "#94a3b8" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="temp" stroke="hsl(199, 89%, 48%)" strokeWidth={2} name="Current Temp" />
              <Line type="monotone" dataKey="baseline" stroke="hsl(142, 76%, 36%)" strokeWidth={2} strokeDasharray="5 5" name="Baseline" />
              <Line type="monotone" dataKey="threshold" stroke="hsl(43, 96%, 56%)" strokeWidth={2} strokeDasharray="5 5" name="Safe Threshold" />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="bg-slate-900/30 backdrop-blur-sm p-4 rounded-lg border-l-4 border-cyan-500 shadow-md">
          <div className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
            <Brain size={16} />
            AI Analysis
          </div>
          <div className="text-slate-300 text-sm leading-relaxed">
            Low coolant and approaching oil change interval. Temperature spike detected over 4 days (82→91°C). Schedule oil change within 1,300 km to restore optimal thermal management. Risk: 3% (Low). Confidence: 92%
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-slate-900">Schedule Oil Change</Button>
          <Button variant="outline" className="border-slate-600">View Similar Cases</Button>
        </div>
      </CardContent>
    </Card>
  )
}

