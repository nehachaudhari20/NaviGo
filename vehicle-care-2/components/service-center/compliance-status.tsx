"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle2, AlertTriangle, Globe, FileCheck, Lock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function ComplianceStatus() {
  const complianceAreas = [
    {
      name: "AI Governance",
      framework: "EU AI Act",
      status: "compliant",
      score: 95,
      lastUpdated: "2 days ago",
      icon: Shield,
      color: "green"
    },
    {
      name: "Data Privacy",
      framework: "GDPR / CCPA",
      status: "compliant",
      score: 98,
      lastUpdated: "1 day ago",
      icon: Lock,
      color: "green"
    },
    {
      name: "Cybersecurity",
      framework: "ISO 27001",
      status: "compliant",
      score: 92,
      lastUpdated: "3 days ago",
      icon: FileCheck,
      color: "green"
    },
    {
      name: "Consumer Protection",
      framework: "EU Consumer Law",
      status: "review",
      score: 88,
      lastUpdated: "5 days ago",
      icon: CheckCircle2,
      color: "orange"
    }
  ]

  const regions = [
    { name: "EU", status: "compliant", frameworks: ["GDPR", "EU AI Act"] },
    { name: "US", status: "compliant", frameworks: ["CCPA", "AI Executive Order"] },
    { name: "APAC", status: "in-progress", frameworks: ["PDPA", "Custom"] }
  ]

  const overallScore = Math.round(
    complianceAreas.reduce((sum, area) => sum + area.score, 0) / complianceAreas.length
  )

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Regulatory Compliance Status
          </CardTitle>
          <Badge className={`${
            overallScore >= 95 ? 'bg-green-100 text-green-700 border-green-300' :
            overallScore >= 85 ? 'bg-orange-100 text-orange-700 border-orange-300' :
            'bg-red-100 text-red-700 border-red-300'
          }`}>
            {overallScore}% Compliant
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Multi-jurisdictional compliance monitoring • Patchwork policy adaptation
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Overall Compliance Score</span>
            <Globe className="h-4 w-4 opacity-75" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{overallScore}%</span>
            <span className="text-sm opacity-75">across all frameworks</span>
          </div>
          <Progress value={overallScore} className="mt-3 h-2 bg-white/20" />
        </div>

        {/* Compliance Areas */}
        <div className="space-y-3">
          {complianceAreas.map((area, idx) => {
            const Icon = area.icon
            const statusColor = area.status === 'compliant' ? 'green' : 'orange'
            return (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 text-${statusColor}-600`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{area.name}</p>
                      <p className="text-xs text-gray-500">{area.framework}</p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      area.status === 'compliant' 
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-orange-100 text-orange-700 border-orange-300'
                    }
                  >
                    {area.status === 'compliant' ? 'Compliant' : 'Review'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Compliance Score</span>
                    <span className="text-xs font-semibold text-gray-900">{area.score}%</span>
                  </div>
                  <Progress value={area.score} className="h-1.5" />
                  <p className="text-xs text-gray-500 mt-1">Updated {area.lastUpdated}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Regional Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Regional Compliance</p>
          <div className="space-y-2">
            {regions.map((region, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">{region.name}</span>
                  <span className="text-xs text-gray-500">
                    ({region.frameworks.join(", ")})
                  </span>
                </div>
                <Badge 
                  className={
                    region.status === 'compliant'
                      ? 'bg-green-100 text-green-700 border-green-300 text-xs'
                      : 'bg-yellow-100 text-yellow-700 border-yellow-300 text-xs'
                  }
                >
                  {region.status === 'compliant' ? '✓ Compliant' : 'In Progress'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* UEBA Security Status */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">UEBA Security Monitoring</p>
              <p className="text-xs text-gray-600">
                Real-time anomaly detection • Automated threat response
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-300">
              Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
