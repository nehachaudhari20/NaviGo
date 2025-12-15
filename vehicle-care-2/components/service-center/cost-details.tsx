"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CostDetails() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly")

  const costItems = [
    { name: "Oil cost", amount: "+$515", color: "text-red-600" },
    { name: "Fluid cost", amount: "+$109", color: "text-green-600" },
    { name: "Battery cost", amount: "+$80", color: "text-yellow-600" },
    { name: "Belt & Hose cost", amount: "+$150", color: "text-blue-600" },
    { name: "Suspension cost", amount: "+$200", color: "text-purple-600" },
  ]

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-gray-800">Cost details</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={period === "monthly" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={period === "yearly" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setPeriod("yearly")}
          >
            Yearly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl font-bold text-gray-900">$156,098</span>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">2.9%</span>
          </div>
        </div>
        <div className="space-y-4">
          {costItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-600">{index + 1}. {item.name}</span>
              <span className={`text-sm font-semibold ${item.color}`}>{item.amount}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

