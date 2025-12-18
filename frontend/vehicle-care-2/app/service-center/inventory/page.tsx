"use client"

import { useState } from "react"
import { Suspense } from "react"
import ServiceCenterSidebar from "@/components/service-center/sidebar"
import ServiceCenterHeader from "@/components/service-center/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Package, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Brain,
  Sparkles,
  Search,
  Plus,
  ShoppingCart,
  DollarSign,
  Activity,
  Clock,
  Zap
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface Part {
  id: string
  name: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  price: number
  status: "critical" | "low" | "normal" | "overstock"
  aiPredictedDemand: number
  aiConfidence: number
  aiRecommendation: string
  lastOrdered: string
  usageRate: number
  reorderPoint: number
}

const parts: Part[] = [
  {
    id: "PART-001",
    name: "Brake Pad Set (Front)",
    category: "Brake System",
    currentStock: 2,
    minStock: 10,
    maxStock: 50,
    unit: "sets",
    price: 2500,
    status: "critical",
    aiPredictedDemand: 15,
    aiConfidence: 92,
    aiRecommendation: "Order immediately - high demand predicted",
    lastOrdered: "2 weeks ago",
    usageRate: 8,
    reorderPoint: 10,
  },
  {
    id: "PART-002",
    name: "Battery (48V)",
    category: "Electrical",
    currentStock: 0,
    minStock: 5,
    maxStock: 20,
    unit: "units",
    price: 8500,
    status: "critical",
    aiPredictedDemand: 8,
    aiConfidence: 95,
    aiRecommendation: "Urgent: Out of stock - order 10 units",
    lastOrdered: "1 month ago",
    usageRate: 3,
    reorderPoint: 5,
  },
  {
    id: "PART-003",
    name: "AC Compressor",
    category: "AC System",
    currentStock: 3,
    minStock: 5,
    maxStock: 15,
    unit: "units",
    price: 12000,
    status: "low",
    aiPredictedDemand: 6,
    aiConfidence: 88,
    aiRecommendation: "Order 5 units to maintain stock",
    lastOrdered: "3 weeks ago",
    usageRate: 2,
    reorderPoint: 5,
  },
  {
    id: "PART-004",
    name: "Engine Oil Filter",
    category: "Engine",
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unit: "units",
    price: 350,
    status: "normal",
    aiPredictedDemand: 30,
    aiConfidence: 85,
    aiRecommendation: "Stock level optimal",
    lastOrdered: "1 week ago",
    usageRate: 25,
    reorderPoint: 20,
  },
  {
    id: "PART-005",
    name: "Transmission Fluid",
    category: "Transmission",
    currentStock: 18,
    minStock: 15,
    maxStock: 40,
    unit: "liters",
    price: 1200,
    status: "normal",
    aiPredictedDemand: 20,
    aiConfidence: 78,
    aiRecommendation: "Monitor - slight increase expected",
    lastOrdered: "2 weeks ago",
    usageRate: 12,
    reorderPoint: 15,
  },
  {
    id: "PART-006",
    name: "Spark Plugs (Set of 4)",
    category: "Engine",
    currentStock: 8,
    minStock: 10,
    maxStock: 30,
    unit: "sets",
    price: 800,
    status: "low",
    aiPredictedDemand: 12,
    aiConfidence: 82,
    aiRecommendation: "Order 10 sets to avoid shortage",
    lastOrdered: "2 weeks ago",
    usageRate: 6,
    reorderPoint: 10,
  },
  {
    id: "PART-007",
    name: "Air Filter",
    category: "Engine",
    currentStock: 65,
    minStock: 30,
    maxStock: 80,
    unit: "units",
    price: 450,
    status: "normal",
    aiPredictedDemand: 35,
    aiConfidence: 80,
    aiRecommendation: "Stock level good",
    lastOrdered: "1 week ago",
    usageRate: 20,
    reorderPoint: 30,
  },
  {
    id: "PART-008",
    name: "Brake Fluid",
    category: "Brake System",
    currentStock: 12,
    minStock: 10,
    maxStock: 25,
    unit: "liters",
    price: 600,
    status: "normal",
    aiPredictedDemand: 15,
    aiConfidence: 75,
    aiRecommendation: "Adequate stock",
    lastOrdered: "1 week ago",
    usageRate: 8,
    reorderPoint: 10,
  },
]

const usageTrend = [
  { month: "Jan", brakePad: 12, battery: 5, acCompressor: 4, oilFilter: 28 },
  { month: "Feb", brakePad: 15, battery: 6, acCompressor: 5, oilFilter: 32 },
  { month: "Mar", brakePad: 18, battery: 7, acCompressor: 6, oilFilter: 35 },
  { month: "Apr", brakePad: 20, battery: 8, acCompressor: 7, oilFilter: 38 },
  { month: "May", brakePad: 22, battery: 9, acCompressor: 8, oilFilter: 40 },
  { month: "Jun", brakePad: 25, battery: 10, acCompressor: 9, oilFilter: 42 },
]

function InventoryContent() {
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [filter, setFilter] = useState<"all" | "critical" | "low" | "normal">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredParts = parts.filter(part => {
    const matchesFilter = filter === "all" || part.status === filter
    const matchesSearch = searchQuery === "" || 
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const sortedParts = [...filteredParts].sort((a, b) => {
    if (a.status === "critical" && b.status !== "critical") return -1
    if (a.status !== "critical" && b.status === "critical") return 1
    if (a.status === "low" && b.status !== "low") return -1
    return 0
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-300"
      case "low":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "normal":
        return "bg-green-100 text-green-700 border-green-300"
      case "overstock":
        return "bg-blue-100 text-blue-700 border-blue-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const criticalCount = parts.filter(p => p.status === "critical").length
  const lowCount = parts.filter(p => p.status === "low").length
  const totalValue = parts.reduce((sum, p) => sum + (p.currentStock * p.price), 0)
  const aiRecommendedOrders = parts.filter(p => p.status === "critical" || p.status === "low").length

  return (
    <div className="flex h-screen bg-gray-50">
      <ServiceCenterSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ServiceCenterHeader />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Inventory Management</h1>
                  <p className="text-sm text-gray-600">AI-powered inventory optimization and demand forecasting</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <Plus size={16} className="mr-2" />
                  Add Part
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-600" />
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-1">{criticalCount}</div>
                  <div className="text-xs text-gray-600">Need Immediate Reorder</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Package size={18} className="text-yellow-600" />
                    Low Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{lowCount}</div>
                  <div className="text-xs text-gray-600">Below Minimum Level</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign size={18} className="text-green-600" />
                    Inventory Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-1">₹{(totalValue / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-gray-600">Total Stock Value</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Brain size={18} className="text-purple-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{aiRecommendedOrders}</div>
                  <div className="text-xs text-gray-600">Pending Orders</div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Trend */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Brain size={18} className="text-purple-600" />
                    Parts Usage Trend (AI Forecasted)
                  </CardTitle>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                    AI Analysis
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="brakePad" stroke="#ef4444" strokeWidth={2} name="Brake Pads" />
                      <Line type="monotone" dataKey="battery" stroke="#f59e0b" strokeWidth={2} name="Batteries" />
                      <Line type="monotone" dataKey="acCompressor" stroke="#3b82f6" strokeWidth={2} name="AC Compressors" />
                      <Line type="monotone" dataKey="oilFilter" stroke="#10b981" strokeWidth={2} name="Oil Filters" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search parts by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All ({parts.length})
                </Button>
                <Button
                  variant={filter === "critical" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("critical")}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Critical ({criticalCount})
                </Button>
                <Button
                  variant={filter === "low" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("low")}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  Low ({lowCount})
                </Button>
                <Button
                  variant={filter === "normal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("normal")}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  Normal
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Parts List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900">Parts Inventory</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      {sortedParts.length} Parts
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sortedParts.map((part) => {
                        const stockPercentage = (part.currentStock / part.maxStock) * 100
                        const isBelowReorder = part.currentStock <= part.reorderPoint
                        return (
                          <div
                            key={part.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedPart?.id === part.id
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                : part.status === "critical"
                                ? "border-red-200 bg-red-50/30"
                                : part.status === "low"
                                ? "border-yellow-200 bg-yellow-50/30"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                            onClick={() => setSelectedPart(part)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="text-sm font-semibold text-gray-900">{part.name}</h4>
                                  <Badge className={`text-xs ${getStatusColor(part.status)}`}>
                                    {part.status.toUpperCase()}
                                  </Badge>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs flex items-center gap-1">
                                    <Brain size={10} />
                                    {part.aiConfidence}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{part.category}</p>
                                <div className="grid grid-cols-3 gap-3 text-xs mb-2">
                                  <div>
                                    <p className="text-gray-600">Current Stock</p>
                                    <p className={`font-semibold ${isBelowReorder ? "text-red-600" : "text-gray-900"}`}>
                                      {part.currentStock} {part.unit}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Min/Max</p>
                                    <p className="font-semibold text-gray-900">
                                      {part.minStock}/{part.maxStock}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Price</p>
                                    <p className="font-semibold text-gray-900">₹{part.price}</p>
                                  </div>
                                </div>
                                <div className="mb-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">Stock Level</span>
                                    <span className="text-xs font-semibold text-gray-900">
                                      {Math.round(stockPercentage)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        stockPercentage < 20
                                          ? "bg-red-600"
                                          : stockPercentage < 50
                                          ? "bg-yellow-600"
                                          : "bg-green-600"
                                      }`}
                                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="p-2 bg-purple-50 rounded border border-purple-200">
                                  <div className="flex items-start gap-2">
                                    <Brain size={14} className="text-purple-600 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-gray-900 mb-0.5">AI: {part.aiRecommendation}</p>
                                      <p className="text-xs text-gray-600">
                                        Predicted demand: {part.aiPredictedDemand} {part.unit}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                              <Button size="sm" variant="outline" className="flex-1 text-xs">
                                <ShoppingCart size={12} className="mr-1" />
                                Order Now
                              </Button>
                              <Button size="sm" variant="ghost" className="text-xs">
                                View Details
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Part Details */}
              <div className="space-y-6">
                {selectedPart ? (
                  <>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900">Part Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Part Name</p>
                            <p className="text-sm font-semibold text-gray-900">{selectedPart.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Category</p>
                            <p className="text-sm font-medium text-gray-900">{selectedPart.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Current Stock</p>
                            <p className={`text-lg font-bold ${selectedPart.currentStock <= selectedPart.reorderPoint ? "text-red-600" : "text-gray-900"}`}>
                              {selectedPart.currentStock} {selectedPart.unit}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Min Stock</p>
                              <p className="text-sm font-semibold text-gray-900">{selectedPart.minStock}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Max Stock</p>
                              <p className="text-sm font-semibold text-gray-900">{selectedPart.maxStock}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Unit Price</p>
                              <p className="text-sm font-semibold text-gray-900">₹{selectedPart.price}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Total Value</p>
                              <p className="text-sm font-semibold text-gray-900">
                                ₹{(selectedPart.currentStock * selectedPart.price).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Usage Rate</p>
                            <p className="text-sm font-semibold text-gray-900">{selectedPart.usageRate} {selectedPart.unit}/month</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Reorder Point</p>
                            <p className="text-sm font-semibold text-gray-900">{selectedPart.reorderPoint} {selectedPart.unit}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Last Ordered</p>
                            <p className="text-sm font-medium text-gray-900">{selectedPart.lastOrdered}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          <Brain size={18} className="text-purple-600" />
                          AI Demand Forecast
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-white rounded-lg border border-purple-200">
                            <p className="text-xs font-medium text-gray-900 mb-1">Predicted Demand</p>
                            <p className="text-2xl font-bold text-purple-600">{selectedPart.aiPredictedDemand} {selectedPart.unit}</p>
                            <p className="text-xs text-gray-600 mt-1">Next 30 days</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-purple-200">
                            <p className="text-xs font-medium text-gray-900 mb-1">Confidence Level</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${selectedPart.aiConfidence}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-gray-900">{selectedPart.aiConfidence}%</span>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-purple-200">
                            <p className="text-xs font-medium text-gray-900 mb-1">AI Recommendation</p>
                            <p className="text-xs text-gray-700">{selectedPart.aiRecommendation}</p>
                          </div>
                          {selectedPart.currentStock <= selectedPart.reorderPoint && (
                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                              <ShoppingCart size={16} className="mr-2" />
                              Order {selectedPart.aiPredictedDemand} {selectedPart.unit}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
                      <Package size={48} className="text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500">Select a part to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <InventoryContent />
    </Suspense>
  )
}
