"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Brain } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"

interface TransmissionComponentProps {
  transmissionData: Array<{ day: string; pressure: number; delay: number }>
}

export default function TransmissionComponent({ transmissionData }: TransmissionComponentProps) {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">⚙️ Transmission (CVT)</h3>
            <p className="text-slate-400 text-sm mt-1">Continuously Variable - Hybrid System</p>
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-500">78/100</Badge>
        </div>

        <div>
          <div className="text-slate-400 text-xs mb-2">Health Status</div>
          <div className="w-full h-8 bg-slate-900/30 backdrop-blur-sm rounded-full overflow-hidden border border-slate-700/30">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-end pr-3 text-white text-xs font-semibold" style={{ width: "78%" }}>
              78%
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            Shift Delay Detected
          </div>
          <div className="text-yellow-200 text-sm">
            Fluid pressure declining. Last occurrence: 2 hours ago. Frequency: 3 times in 24 hours, pattern during aggressive acceleration.
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Fluid Pressure", value: "135 bar", status: "warning", desc: "⚠️ Low (normal: 140-160)" },
            { label: "Shift Delay", value: "145 ms", status: "warning", desc: "⚠️ Slow (normal: <100ms)" },
            { label: "Fluid Temp", value: "88°C", status: "warning", desc: "⚠️ Hot (normal: 70-85°C)" },
            { label: "Deterioration", value: "-0.75%/day", status: "warning", desc: "⚠️ Trending down" },
          ].map((metric, i) => (
            <div key={i} className="bg-slate-900/30 backdrop-blur-sm p-4 rounded-lg border-l-4 border-cyan-500 shadow-md">
              <div className="text-slate-400 text-xs uppercase mb-1">{metric.label}</div>
              <div className="text-xl font-semibold">{metric.value}</div>
              <div className="text-yellow-500 text-xs mt-1">{metric.desc}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg p-5 shadow-md">
          <div className="text-center text-slate-300 font-semibold text-sm mb-4">Fluid Pressure vs Shift Delay Correlation</div>
          <ChartContainer
            config={{
              pressure: { label: "Fluid Pressure", color: "hsl(199, 89%, 48%)" },
              delay: { label: "Shift Delay", color: "hsl(142, 76%, 36%)" },
            }}
            className="h-[300px]"
          >
            <LineChart data={transmissionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: "#94a3b8" }} />
              <YAxis yAxisId="left" className="text-xs" tick={{ fill: "#94a3b8" }} />
              <YAxis yAxisId="right" orientation="right" className="text-xs" tick={{ fill: "#94a3b8" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line yAxisId="left" type="monotone" dataKey="pressure" stroke="hsl(199, 89%, 48%)" strokeWidth={2} name="Fluid Pressure (bar)" />
              <Line yAxisId="right" type="monotone" dataKey="delay" stroke="hsl(142, 76%, 36%)" strokeWidth={2} name="Shift Delay (ms)" />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="bg-slate-900/30 backdrop-blur-sm p-4 rounded-lg border-l-4 border-cyan-500 shadow-md">
          <div className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
            <Brain size={16} />
            AI Analysis
          </div>
          <div className="text-slate-300 text-sm leading-relaxed">
            Transmission fluid degradation detected. Strong correlation between pressure drop and shift delay. Reduce aggressive acceleration until fluid flush scheduled. Remaining useful life: 8-12 days. Risk: 8%. Confidence: 88%
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-slate-900">Schedule Fluid Flush</Button>
          <Button variant="outline" className="border-slate-600">Driving Tips</Button>
        </div>
      </CardContent>
    </Card>
  )
}

