"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ROIMetrics from "@/components/service-center/roi-metrics"
import ComplianceStatus from "@/components/service-center/compliance-status"
import HumanAIHarmony from "@/components/service-center/human-ai-harmony"
import { DollarSign, Shield, Users } from "lucide-react"

export default function BusinessIntelligence() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900">Business Intelligence</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="roi" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              ROI & Value
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="harmony" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Human-AI
            </TabsTrigger>
          </TabsList>
          <TabsContent value="roi" className="mt-4">
            <ROIMetrics />
          </TabsContent>
          <TabsContent value="compliance" className="mt-4">
            <ComplianceStatus />
          </TabsContent>
          <TabsContent value="harmony" className="mt-4">
            <HumanAIHarmony />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
