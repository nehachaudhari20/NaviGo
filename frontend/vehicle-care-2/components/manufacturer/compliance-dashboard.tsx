"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Globe, CheckCircle2, AlertTriangle, FileCheck, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function ComplianceDashboard() {
  const complianceStatus = {
    overall: 94,
    regions: [
      { name: "EU", score: 96, frameworks: ["GDPR", "EU AI Act"], status: "compliant" },
      { name: "US", score: 93, frameworks: ["CCPA", "AI Executive Order"], status: "compliant" },
      { name: "APAC", score: 91, frameworks: ["PDPA", "Custom"], status: "in-progress" }
    ],
    areas: [
      { name: "AI Governance", score: 95, trend: "+2%" },
      { name: "Data Privacy", score: 98, trend: "+1%" },
      { name: "Cybersecurity", score: 92, trend: "+3%" },
      { name: "Quality Standards", score: 96, trend: "+1%" }
    ]
  }

  const recentUpdates = [
    { framework: "EU AI Act", status: "Updated", date: "2 days ago", impact: "High" },
    { framework: "GDPR", status: "Compliant", date: "1 week ago", impact: "Medium" },
    { framework: "ISO 27001", status: "Audit Passed", date: "2 weeks ago", impact: "High" }
  ]

  return (
    <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            Compliance Dashboard
          </CardTitle>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            {complianceStatus.overall}% Compliant
          </Badge>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Multi-jurisdictional compliance • Patchwork policy adaptation • Real-time monitoring
        </p>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        {/* Overall Score */}
        <div className="bg-gradient-to-r from-purple-600/80 to-indigo-600/80 rounded-lg p-4 text-white backdrop-blur-sm border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Global Compliance Score</span>
            <Globe className="h-4 w-4 opacity-75" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{complianceStatus.overall}%</span>
            <span className="text-sm opacity-75">across all regions</span>
          </div>
          <Progress value={complianceStatus.overall} className="mt-3 h-2 bg-white/20" />
        </div>

        {/* Regional Compliance */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-300">Regional Compliance Status</p>
          {complianceStatus.regions.map((region, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">{region.name}</p>
                    <p className="text-xs text-gray-400">{region.frameworks.join(", ")}</p>
                  </div>
                </div>
                <Badge 
                  className={
                    region.status === 'compliant'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }
                >
                  {region.status === 'compliant' ? '✓ Compliant' : 'In Progress'}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Compliance Score</span>
                  <span className="text-xs font-semibold text-white">{region.score}%</span>
                </div>
                <Progress value={region.score} className="h-1.5 bg-white/10" />
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Areas */}
        <div className="grid grid-cols-2 gap-2">
          {complianceStatus.areas.map((area, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-lg p-2.5 backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-300">{area.name}</p>
                <TrendingUp className="h-3 w-3 text-green-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">{area.score}%</span>
                <span className="text-xs text-green-400">{area.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Updates */}
        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-300 mb-2">Recent Compliance Updates</p>
          <div className="space-y-2">
            {recentUpdates.map((update, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white">{update.framework}</p>
                  <p className="text-xs text-gray-400">{update.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={
                      update.impact === 'High'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30 text-xs'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs'
                    }
                  >
                    {update.impact} Impact
                  </Badge>
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patchwork Policy Status */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <FileCheck className="h-4 w-4 text-orange-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-300 mb-1">Patchwork Policy Adaptation</p>
              <p className="text-xs text-gray-400 mb-2">
                System automatically adapts to regional regulatory changes. Last update: 2 days ago.
              </p>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                Auto-Adaptive Active
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
