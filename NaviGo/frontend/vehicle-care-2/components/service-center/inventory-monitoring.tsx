"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SparePartsRequirements from "@/components/service-center/spare-parts-requirements"
import FleetAnomalyList from "@/components/service-center/fleet-anomaly-list"
import DamagedPartsTracking from "@/components/service-center/damaged-parts-tracking"
import { Package, AlertTriangle, Factory } from "lucide-react"

export default function InventoryMonitoring() {
  return (
    <Tabs defaultValue="inventory" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-4 bg-gray-100 p-1">
        <TabsTrigger 
          value="inventory" 
          className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Package size={14} />
          Inventory
        </TabsTrigger>
        <TabsTrigger 
          value="damaged" 
          className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Factory size={14} />
          Damaged Parts
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="inventory" className="mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SparePartsRequirements />
          <FleetAnomalyList />
        </div>
      </TabsContent>
      
      <TabsContent value="damaged" className="mt-0">
        <DamagedPartsTracking />
      </TabsContent>
    </Tabs>
  )
}
