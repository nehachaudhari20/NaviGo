"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import professional components
import HeroSection from "@/components/servicing/hero-section"
import AIPredictionsServices from "@/components/servicing/ai-predictions-services"
import EngineComponent from "@/components/servicing/engine-component"
import TransmissionComponent from "@/components/servicing/transmission-component"
import BrakesComponent from "@/components/servicing/brakes-component"
import TyreSection from "@/components/servicing/tyre-section"
import AnalyticsSummary from "@/components/servicing/analytics-summary"

export default function ServicingPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }
  // Vehicle Information
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

  // Health Status
  const healthStatus = {
    overall: 87,
    mechanical: 84,
    electrical: 91,
    tyres: 78,
  }

  // Chart Data
  const engineTempData = [
    { day: "Day 1", temp: 82, baseline: 82, threshold: 85 },
    { day: "Day 5", temp: 82, baseline: 82, threshold: 85 },
    { day: "Day 10", temp: 82, baseline: 82, threshold: 85 },
    { day: "Day 15", temp: 83, baseline: 82, threshold: 85 },
    { day: "Day 20", temp: 85, baseline: 82, threshold: 85 },
    { day: "Day 25", temp: 88, baseline: 82, threshold: 85 },
    { day: "Day 30", temp: 91, baseline: 82, threshold: 85 },
  ]

  const transmissionData = [
    { day: "Day 1", pressure: 150, delay: 95 },
    { day: "Day 5", pressure: 148, delay: 100 },
    { day: "Day 10", pressure: 145, delay: 110 },
    { day: "Day 15", pressure: 142, delay: 125 },
    { day: "Day 20", pressure: 138, delay: 135 },
    { day: "Day 25", pressure: 136, delay: 140 },
    { day: "Day 30", pressure: 135, delay: 145 },
  ]

  const brakePadData = [
    { day: "Day 1", FL: 78, FR: 76, RL: 62, RR: 64, threshold: 50 },
    { day: "Day 5", FL: 76, FR: 74, RL: 60, RR: 62, threshold: 50 },
    { day: "Day 10", FL: 74, FR: 72, RL: 58, RR: 60, threshold: 50 },
    { day: "Day 15", FL: 72, FR: 70, RL: 56, RR: 58, threshold: 50 },
    { day: "Day 20", FL: 70, FR: 68, RL: 54, RR: 56, threshold: 50 },
  ]

  const tyrePressureData = [
    { day: "Day 1", FL: 2.2, FR: 2.2, RL: 2.2, RR: 2.2 },
    { day: "Day 5", FL: 2.2, FR: 2.2, RL: 2.19, RR: 2.2 },
    { day: "Day 10", FL: 2.2, FR: 2.2, RL: 2.17, RR: 2.2 },
    { day: "Day 15", FL: 2.2, FR: 2.2, RL: 2.15, RR: 2.19 },
    { day: "Day 20", FL: 2.2, FR: 2.2, RL: 2.13, RR: 2.19 },
    { day: "Day 25", FL: 2.2, FR: 2.2, RL: 2.11, RR: 2.19 },
    { day: "Day 30", FL: 2.2, FR: 2.2, RL: 2.1, RR: 2.2 },
  ]

  // Analytics Summary
  const analyticsSummary = {
    anomalies: 7,
    accuracy: "98.4%",
    dataPoints: "47.2M",
    latency: "2.3 sec",
    savings: "₹89,800",
    falsePositive: "2.1%",
  }

  // Merged AI Predictions & Services Data
  const aiPredictionsServices = [
    {
      id: 1,
      component: "Brake System",
      issue: "Front brake pads at 78% wear, deteriorating 0.75% per day",
      serviceName: "Brake Pad Replacement (Front + Rear)",
      severity: "critical" as const,
      priority: "URGENT" as const,
      confidence: 94,
      predictedDate: "Sep 20, 2024",
      impact: "Risk of brake failure if delayed >10 days",
      recommendation: "Schedule pad replacement within 500 km",
      status: "active" as const,
      km: "500 km",
      cost: "₹5,200",
      time: "2 hours",
      why: "Front pads at 78% wear, deteriorating 0.75%/day. Failure risk 12% if delayed >10 days.",
      benefit: "Prevent ₹45,000 emergency repair. Cost savings: ₹39,800.",
    },
    {
      id: 2,
      component: "Engine Cooling System",
      issue: "Engine temperature elevated (91°C vs 82°C baseline)",
      serviceName: "Oil Change + Coolant Top-up",
      severity: "high" as const,
      priority: "HIGH" as const,
      confidence: 92,
      predictedDate: "Sep 25, 2024",
      impact: "Potential overheating and engine damage",
      recommendation: "Oil change + coolant top-up within 1,300 km",
      status: "active" as const,
      km: "1,300 km",
      cost: "₹800",
      time: "30 mins",
      why: "Engine temp elevated (91°C vs 82°C baseline). Coolant at 95%.",
      benefit: "Restore thermal baseline. Extend engine lifespan by 2+ years.",
    },
    {
      id: 3,
      component: "Transmission",
      issue: "Fluid pressure declining, shift delay increasing",
      serviceName: "Transmission Fluid Flush",
      severity: "high" as const,
      priority: "HIGH" as const,
      confidence: 88,
      predictedDate: "Oct 5, 2024",
      impact: "Transmission failure risk if not addressed",
      recommendation: "Schedule fluid flush within 5,000 km",
      status: "active" as const,
      km: "5,000 km",
      cost: "₹2,500",
      time: "3 hours",
      why: "Fluid pressure declining. Shift delay 145ms (normal <100ms).",
      benefit: "Restore pressure 135→160 bar. Prevent ₹35,000 emergency repair.",
    },
    {
      id: 4,
      component: "Tyre System",
      issue: "Rear Left tyre showing gradual pressure drop",
      serviceName: "Tyre Inspection & Pressure Check",
      severity: "medium" as const,
      priority: "MEDIUM" as const,
      confidence: 75,
      predictedDate: "Oct 15, 2024",
      impact: "Possible slow leak or natural pressure loss",
      recommendation: "Schedule inspection within 2 weeks",
      status: "monitoring" as const,
    },
  ]

  return (
    <div className="flex h-screen bg-black text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto p-5 space-y-6">
            {/* PART 2: HERO SECTION */}
            <HeroSection vehicleInfo={vehicleInfo} healthStatus={healthStatus} />

            {/* PART 3: AI PREDICTIONS & RECOMMENDED SERVICES (MERGED) */}
            <AIPredictionsServices predictions={aiPredictionsServices} />

            {/* PART 4: MECHANICAL COMPONENTS */}
            <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-400">Mechanical Components</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="engine" className="w-full">
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

                  <TabsContent value="engine">
                    <EngineComponent engineTempData={engineTempData} />
                </TabsContent>

                  <TabsContent value="transmission">
                    <TransmissionComponent transmissionData={transmissionData} />
                </TabsContent>

                  <TabsContent value="brakes">
                    <BrakesComponent brakePadData={brakePadData} />
                </TabsContent>
              </Tabs>
              </CardContent>
            </Card>

            {/* PART 5: TYRE SECTION */}
            <TyreSection tyrePressureData={tyrePressureData} />


            {/* PART 7: ANALYTICS SUMMARY */}
            <AnalyticsSummary analytics={analyticsSummary} />

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
