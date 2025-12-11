"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Gauge,
  Zap,
  Wind,
  Calendar,
  MapPin,
  MessageSquare,
  Download,
  Eye,
  ArrowDown,
  Database,
  Cpu,
  Brain,
  CheckCircle2,
  Clock,
  BarChart3,
  Wrench,
  Settings,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

export default function ServicingPage() {
  const [selectedTab, setSelectedTab] = useState("engine")
  const [selectedServices, setSelectedServices] = useState<number[]>([1, 2])

  const vehicleInfo = {
    name: "Mahindra XEV 9e",
    variant: "Elite Plus",
    color: "Pearl White",
    registration: "MH-07-AB-1234",
    mileage: "23,450 km",
    serviceHistory: 5,
    lastService: "45 days",
    warranty: "Active till Dec 2027",
    image: "/mahindra-xev9e.png",
  }

  const healthStatus = {
    overall: 87,
    mechanical: 84,
    electrical: 91,
    tyres: 78,
  }

  // Engine temperature data
  const engineTempData = [
    { day: "Day 1", temp: 82, baseline: 82, threshold: 85 },
    { day: "Day 5", temp: 82, baseline: 82, threshold: 85 },
    { day: "Day 10", temp: 82, baseline: 82, threshold: 85 },
    { day: "Day 15", temp: 83, baseline: 82, threshold: 85 },
    { day: "Day 20", temp: 85, baseline: 82, threshold: 85 },
    { day: "Day 25", temp: 88, baseline: 82, threshold: 85 },
    { day: "Day 30", temp: 91, baseline: 82, threshold: 85 },
  ]

  // Transmission correlation data
  const transmissionData = [
    { day: "Day 1", pressure: 150, delay: 95 },
    { day: "Day 5", pressure: 148, delay: 100 },
    { day: "Day 10", pressure: 145, delay: 110 },
    { day: "Day 15", pressure: 142, delay: 125 },
    { day: "Day 20", pressure: 138, delay: 135 },
    { day: "Day 25", pressure: 136, delay: 140 },
    { day: "Day 30", pressure: 135, delay: 145 },
  ]

  // Brake pad wear data
  const brakePadData = [
    { day: "Day 1", FL: 78, FR: 76, RL: 62, RR: 64, threshold: 50 },
    { day: "Day 5", FL: 76, FR: 74, RL: 60, RR: 62, threshold: 50 },
    { day: "Day 10", FL: 74, FR: 72, RL: 58, RR: 60, threshold: 50 },
    { day: "Day 15", FL: 72, FR: 70, RL: 56, RR: 58, threshold: 50 },
    { day: "Day 20", FL: 70, FR: 68, RL: 54, RR: 56, threshold: 50 },
  ]

  // Tyre pressure data
  const tyrePressureData = [
    { day: "Day 1", FL: 2.2, FR: 2.2, RL: 2.2, RR: 2.2 },
    { day: "Day 5", FL: 2.2, FR: 2.2, RL: 2.19, RR: 2.2 },
    { day: "Day 10", FL: 2.2, FR: 2.2, RL: 2.17, RR: 2.2 },
    { day: "Day 15", FL: 2.2, FR: 2.2, RL: 2.15, RR: 2.19 },
    { day: "Day 20", FL: 2.2, FR: 2.2, RL: 2.13, RR: 2.19 },
    { day: "Day 25", FL: 2.2, FR: 2.2, RL: 2.11, RR: 2.19 },
    { day: "Day 30", FL: 2.2, FR: 2.2, RL: 2.1, RR: 2.2 },
  ]

  const recommendedServices = [
    {
      id: 1,
      name: "Brake Pad Replacement (Front + Rear)",
      priority: "URGENT",
      priorityColor: "bg-red-500/20",
      priorityText: "text-red-600",
      borderColor: "border-red-500",
      km: "500 km",
      cost: "₹5,200",
      time: "2 hours",
      confidence: "94% (Very High)",
      why: "Front pads at 78% wear, deteriorating 0.75%/day. Failure risk 12% if delayed >10 days.",
      benefit: "Prevent ₹45,000 emergency repair. Cost savings: ₹39,800.",
    },
    {
      id: 2,
      name: "Oil Change + Coolant Top-up",
      priority: "HIGH",
      priorityColor: "bg-yellow-500/20",
      priorityText: "text-yellow-600",
      borderColor: "border-yellow-500",
      km: "1,300 km",
      cost: "₹800",
      time: "30 mins",
      confidence: "92% (Very High)",
      why: "Engine temp elevated (91°C vs 82°C baseline). Coolant at 95%.",
      benefit: "Restore thermal baseline. Extend engine lifespan by 2+ years.",
    },
    {
      id: 3,
      name: "Transmission Fluid Flush",
      priority: "HIGH",
      priorityColor: "bg-yellow-500/20",
      priorityText: "text-yellow-600",
      borderColor: "border-yellow-500",
      km: "5,000 km",
      cost: "₹2,500",
      time: "3 hours",
      confidence: "88% (High)",
      why: "Fluid pressure declining. Shift delay 145ms (normal <100ms).",
      benefit: "Restore pressure 135→160 bar. Prevent ₹35,000 emergency repair.",
    },
  ]

  const analyticsSummary = {
    anomalies: 7,
    accuracy: "98.4%",
    dataPoints: "47.2M",
    latency: "2.3 sec",
    savings: "₹89,800",
    falsePositive: "2.1%",
  }

  const getHealthColor = (value: number) => {
    if (value >= 85) return "text-green-500"
    if (value >= 75) return "text-yellow-500"
    return "text-red-500"
  }

  const getHealthBadge = (value: number) => {
    if (value >= 85) return "bg-green-500/20 text-green-500"
    if (value >= 75) return "bg-yellow-500/20 text-yellow-500"
    return "bg-red-500/20 text-red-500"
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto p-5 space-y-8">
            {/* HEADER */}
            <Card className="bg-slate-800/80 backdrop-blur-lg border-cyan-500/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-400 flex items-center gap-2">
                  <Wrench className="text-cyan-400" size={28} />
                  DriveAI Protect - Servicing Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-between gap-5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Vehicle:</span>
                    <span className="font-semibold">Mahindra XEV 9e (Elite Plus)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Registration:</span>
                    <span className="font-semibold">MH-07-AB-1234</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Mileage:</span>
                    <span className="font-semibold">23,450 km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Last Service:</span>
                    <span className="font-semibold">45 days ago</span>
                  </div>
            </div>
              </CardContent>
            </Card>

            {/* HERO SECTION */}
            <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700/50 shadow-xl">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="bg-slate-900/80 rounded-xl p-5 text-center">
                  <img
                    src={vehicleInfo.image || "/placeholder.svg"}
                    alt={vehicleInfo.name}
                      className="w-full h-auto rounded-lg shadow-lg shadow-cyan-500/20"
                    />
                    <p className="mt-4 text-slate-400 text-xs">Pearl White | Elite Plus Variant</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/60 p-3 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Color</div>
                        <div className="text-lg font-semibold">Pearl White</div>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Mileage</div>
                        <div className="text-lg font-semibold">23,450 km</div>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Warranty</div>
                        <div className="text-lg font-semibold">Active (Dec 2027)</div>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Last Service</div>
                        <div className="text-lg font-semibold">45 days ago</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-slate-400 text-xs uppercase tracking-wide mb-4">Health Overview</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/60 p-4 rounded-lg text-center border border-slate-700">
                          <div className="text-slate-400 text-xs uppercase mb-2">Overall</div>
                          <div className={`text-2xl font-bold ${getHealthColor(healthStatus.overall)}`}>
                            {healthStatus.overall}/100
                          </div>
                        </div>
                        <div className="bg-slate-900/60 p-4 rounded-lg text-center border border-slate-700">
                          <div className="text-slate-400 text-xs uppercase mb-2">Mechanical</div>
                          <div className={`text-2xl font-bold ${getHealthColor(healthStatus.mechanical)}`}>
                            {healthStatus.mechanical}/100
                          </div>
                        </div>
                        <div className="bg-slate-900/60 p-4 rounded-lg text-center border border-slate-700">
                          <div className="text-slate-400 text-xs uppercase mb-2">Electrical</div>
                          <div className={`text-2xl font-bold ${getHealthColor(healthStatus.electrical)}`}>
                            {healthStatus.electrical}/100
                          </div>
                        </div>
                        <div className="bg-slate-900/60 p-4 rounded-lg text-center border border-slate-700">
                          <div className="text-slate-400 text-xs uppercase mb-2">Tyres</div>
                          <div className={`text-2xl font-bold ${getHealthColor(healthStatus.tyres)}`}>
                            {healthStatus.tyres}/100
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DATA PIPELINE DIAGRAM */}
            <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-cyan-400 text-center">🤖 AI Data Analysis Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
                  {[
                    { num: 1, title: "Vehicle Sensors", desc: "CAN-BUS, BMS, TPMS, ADAS" },
                    { num: 2, title: "Data Ingestion", desc: "Normalization, Validation, Enrichment" },
                    { num: 3, title: "Anomaly Detection", desc: "Isolation Forest ML Model" },
                    { num: 4, title: "AI Diagnosis", desc: "LangGraph + GPT-4 Reasoning" },
                    { num: 5, title: "Confidence Check", desc: "4-Factor Scoring (92-96%)" },
                    { num: 6, title: "Smart Scheduling", desc: "OR-Tools CSP Optimization" },
                  ].map((stage, idx) => (
                    <div key={idx} className="relative">
                      <div className="bg-slate-900/80 border-2 border-cyan-500 rounded-lg p-5 text-center">
                        <div className="inline-block bg-cyan-500 text-slate-900 w-8 h-8 rounded-full leading-8 font-bold mb-2">
                          {stage.num}
                        </div>
                        <div className="text-cyan-400 font-semibold text-sm mb-1">{stage.title}</div>
                        <div className="text-slate-300 text-xs">{stage.desc}</div>
                      </div>
                      {idx < 5 && (
                        <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-cyan-500 text-2xl z-10">
                          →
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* MECHANICAL COMPONENTS */}
            <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-400 flex items-center gap-2">
                  <Settings className="text-cyan-400" size={24} />
                  Mechanical Components
                </CardTitle>
              </CardHeader>
              <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="bg-slate-900/60 border-b-2 border-slate-700 mb-6">
                    <TabsTrigger value="engine" className="data-[state=active]:border-b-2 data-[state=active]:border-cyan-500">
                      Engine
                  </TabsTrigger>
                    <TabsTrigger value="transmission" className="data-[state=active]:border-b-2 data-[state=active]:border-cyan-500">
                      Transmission
                  </TabsTrigger>
                    <TabsTrigger value="brakes" className="data-[state=active]:border-b-2 data-[state=active]:border-cyan-500">
                      Brakes
                  </TabsTrigger>
                </TabsList>

                  {/* ENGINE TAB */}
                  <TabsContent value="engine" className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">🔧 Engine</h3>
                        <p className="text-slate-400 text-sm mt-1">4-Cylinder EV Charger</p>
                      </div>
                      <Badge className={getHealthBadge(84)}>84/100</Badge>
                    </div>

                    <div>
                      <div className="text-slate-400 text-xs mb-2">Health Status</div>
                      <div className="w-full h-8 bg-slate-900/60 rounded-full overflow-hidden border border-slate-700">
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
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Temperature</div>
                        <div className="text-xl font-semibold">91°C</div>
                        <div className="text-yellow-500 text-xs mt-1">⚠️ +9°C above baseline</div>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Oil Pressure</div>
                        <div className="text-xl font-semibold">2.8 bar</div>
                        <div className="text-green-500 text-xs mt-1">✓ Normal (2.5-3.0)</div>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Coolant Level</div>
                        <div className="text-xl font-semibold">95%</div>
                        <div className="text-yellow-500 text-xs mt-1">⚠️ Low (normal: 100%)</div>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Deterioration</div>
                        <div className="text-xl font-semibold">+2.3°C/day</div>
                        <div className="text-yellow-500 text-xs mt-1">⚠️ Trending up</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-5">
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

                    <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
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
                </TabsContent>

                  {/* TRANSMISSION TAB */}
                  <TabsContent value="transmission" className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">⚙️ Transmission (CVT)</h3>
                        <p className="text-slate-400 text-sm mt-1">Continuously Variable - Hybrid System</p>
                      </div>
                      <Badge className={getHealthBadge(78)}>78/100</Badge>
                    </div>

                    <div>
                      <div className="text-slate-400 text-xs mb-2">Health Status</div>
                      <div className="w-full h-8 bg-slate-900/60 rounded-full overflow-hidden border border-slate-700">
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
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Fluid Pressure</div>
                        <div className="text-xl font-semibold">135 bar</div>
                        <div className="text-yellow-500 text-xs mt-1">⚠️ Low (normal: 140-160)</div>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Shift Delay</div>
                        <div className="text-xl font-semibold">145 ms</div>
                        <div className="text-yellow-500 text-xs mt-1">⚠️ Slow (normal: &lt;100ms)</div>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Fluid Temp</div>
                        <div className="text-xl font-semibold">88°C</div>
                        <div className="text-yellow-500 text-xs mt-1">⚠️ Hot (normal: 70-85°C)</div>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Deterioration</div>
                        <div className="text-xl font-semibold">-0.75%/day</div>
                        <div className="text-yellow-500 text-xs mt-1">⚠️ Trending down</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-5">
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

                    <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
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
                </TabsContent>

                  {/* BRAKES TAB */}
                  <TabsContent value="brakes" className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">🛑 Brakes</h3>
                        <p className="text-slate-400 text-sm mt-1">Regenerative + Hydraulic Blend System</p>
                      </div>
                      <Badge className={getHealthBadge(72)}>72/100</Badge>
                    </div>

                    <div>
                      <div className="text-slate-400 text-xs mb-2">Health Status</div>
                      <div className="w-full h-8 bg-slate-900/60 rounded-full overflow-hidden border border-slate-700">
                        <div className="h-full bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-end pr-3 text-white text-xs font-semibold" style={{ width: "72%" }}>
                          72%
                        </div>
                            </div>
                          </div>

                    <div className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-4">
                      <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        URGENT: Brake Pad Replacement Needed
                      </div>
                      <div className="text-red-200 text-sm">
                        Front pads at 78% wear, deteriorating 0.75% per day. Estimated replacement in 29 days or 500 km (whichever comes first). Risk of brake failure: 12%. DO NOT DELAY.
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Front Pad Wear</div>
                        <div className="text-xl font-semibold">78%</div>
                        <div className="text-red-500 text-xs mt-1">🔴 URGENT</div>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Rear Pad Wear</div>
                        <div className="text-xl font-semibold">62%</div>
                        <div className="text-yellow-500 text-xs mt-1">⚠️ Monitor</div>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Hydraulic Pressure</div>
                        <div className="text-xl font-semibold">240 bar</div>
                        <div className="text-green-500 text-xs mt-1">✓ Normal</div>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                        <div className="text-slate-400 text-xs uppercase mb-1">Failure Risk</div>
                        <div className="text-xl font-semibold">12%</div>
                        <div className="text-red-500 text-xs mt-1">🔴 Medium-High</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-5">
                      <div className="text-center text-slate-300 font-semibold text-sm mb-4">Brake Pad Wear Forecast (All Wheels)</div>
                      <ChartContainer
                        config={{
                          FL: { label: "FL (Front Left) - URGENT", color: "hsl(0, 84%, 60%)" },
                          FR: { label: "FR (Front Right) - URGENT", color: "hsl(25, 95%, 53%)" },
                          RL: { label: "RL (Rear Left)", color: "hsl(199, 89%, 48%)" },
                          RR: { label: "RR (Rear Right)", color: "hsl(262, 83%, 58%)" },
                          threshold: { label: "Replacement Threshold", color: "hsl(43, 96%, 56%)" },
                        }}
                        className="h-[300px]"
                      >
                        <LineChart data={brakePadData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
                          <XAxis dataKey="day" className="text-xs" tick={{ fill: "#94a3b8" }} />
                          <YAxis className="text-xs" tick={{ fill: "#94a3b8" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Line type="monotone" dataKey="FL" stroke="hsl(0, 84%, 60%)" strokeWidth={2} />
                          <Line type="monotone" dataKey="FR" stroke="hsl(25, 95%, 53%)" strokeWidth={2} />
                          <Line type="monotone" dataKey="RL" stroke="hsl(199, 89%, 48%)" strokeWidth={2} />
                          <Line type="monotone" dataKey="RR" stroke="hsl(262, 83%, 58%)" strokeWidth={2} />
                          <Line type="monotone" dataKey="threshold" stroke="hsl(43, 96%, 56%)" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                      </ChartContainer>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                      <div className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                        <Brain size={16} />
                        AI Analysis
                      </div>
                      <div className="text-slate-300 text-sm leading-relaxed">
                        Front brake pads critical. Deteriorating 0.75%/day due to urban driving and hard braking patterns. Increase regen braking on downhill slopes to extend pad life by 25-30%. Schedule replacement within 500 km. Cost: ₹5,200. Benefit: Avoid ₹45,000 emergency repair. Confidence: 94%
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="bg-cyan-500 hover:bg-cyan-600 text-slate-900">Schedule Pad Replacement NOW</Button>
                      <Button variant="outline" className="border-slate-600">Optimization Tips</Button>
                  </div>
                </TabsContent>
              </Tabs>
              </CardContent>
            </Card>

            {/* TYRES SECTION */}
            <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-400 flex items-center gap-2">
                  <Wind className="text-cyan-400" size={24} />
                  Tyre Health & Pressure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { pos: "FL", label: "Front Left", pressure: 2.2, temp: 42, wear: 64, status: "good" },
                    { pos: "FR", label: "Front Right", pressure: 2.2, temp: 43, wear: 62, status: "good" },
                    { pos: "RL", label: "Rear Left", pressure: 2.1, temp: 41, wear: 68, status: "warning" },
                    { pos: "RR", label: "Rear Right", pressure: 2.2, temp: 42, wear: 66, status: "good" },
                  ].map((tyre) => (
                    <div key={tyre.pos} className="bg-slate-900/60 border border-slate-700 rounded-lg p-5 text-center">
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

                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-5">
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

            {/* SERVICE RECOMMENDATIONS */}
            <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-400 flex items-center gap-2">
                  <Calendar className="text-cyan-400" size={24} />
                  Recommended Services (Priority-Ordered by AI)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedServices.map((service) => (
                  <div
                    key={service.id}
                    className={`bg-slate-900/60 border-l-4 ${service.borderColor} rounded-lg p-5 grid md:grid-cols-[1fr_auto] gap-5 items-start`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`${service.priorityColor} ${service.priorityText}`}>{service.priority}</Badge>
                        <h3 className="text-lg font-semibold">{service.name}</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400 text-xs uppercase mb-1">Distance Remaining</div>
                          <div className="font-semibold">{service.km}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs uppercase mb-1">Cost</div>
                          <div className="font-semibold">{service.cost}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs uppercase mb-1">Duration</div>
                          <div className="font-semibold">{service.time}</div>
                    </div>
                      <div>
                          <div className="text-slate-400 text-xs uppercase mb-1">AI Confidence</div>
                          <div className="font-semibold">{service.confidence}</div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg text-sm leading-relaxed ${
                        service.priority === "URGENT" ? "bg-red-500/10 text-red-200" : "bg-yellow-500/10 text-yellow-200"
                      }`}>
                        <strong>Why:</strong> {service.why}
                        <br />
                        <strong>Benefit:</strong> {service.benefit}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 whitespace-nowrap">Schedule Now</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ANALYTICS SUMMARY */}
            <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-400">📊 AI Analytics Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                    <div className="text-slate-400 text-xs uppercase mb-1">Total Anomalies Detected</div>
                    <div className="text-xl font-semibold">{analyticsSummary.anomalies}</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                    <div className="text-slate-400 text-xs uppercase mb-1">Avg Prediction Accuracy</div>
                    <div className="text-xl font-semibold">{analyticsSummary.accuracy}</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                    <div className="text-slate-400 text-xs uppercase mb-1">Data Points Processed</div>
                    <div className="text-xl font-semibold">{analyticsSummary.dataPoints}</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                    <div className="text-slate-400 text-xs uppercase mb-1">Processing Latency</div>
                    <div className="text-xl font-semibold">{analyticsSummary.latency}</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                    <div className="text-slate-400 text-xs uppercase mb-1">Potential Savings</div>
                    <div className="text-xl font-semibold">{analyticsSummary.savings}</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-cyan-500">
                    <div className="text-slate-400 text-xs uppercase mb-1">False Positive Rate</div>
                    <div className="text-xl font-semibold">{analyticsSummary.falsePositive}</div>
              </div>
            </div>

                <div className="bg-green-500/10 border-l-4 border-green-500 rounded-lg p-4">
                  <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle size={16} />
                    Preventive Success Story
                      </div>
                  <div className="text-slate-300 text-sm leading-relaxed">
                    You've completed 5 preventive services over 7 months. This proactive approach has prevented 2 emergency breakdowns (estimated ₹67,200+ in emergency costs). Your ROI: 1,058% - every ₹1 spent on preventive service saves ₹10.58 in potential emergency repairs.
                  </div>
              </div>
              </CardContent>
            </Card>

            {/* FOOTER */}
            <div className="text-center text-slate-500 text-xs py-5 border-t border-slate-700">
              <p>DriveAI Protect uses advanced telemetry, AI analysis, and predictive maintenance to keep your Mahindra XEV 9e running optimally.</p>
              <p className="mt-2">Last updated: December 10, 2025 | Data confidence: 98.4% | Next analysis: In 24 hours</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
