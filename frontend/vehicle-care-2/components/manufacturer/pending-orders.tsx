"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"

const orders = [
  {
    id: "#1245",
    customer: "John Doe",
    date: "2024-09-10",
    status: "Processing",
    statusColor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  {
    id: "#1246",
    customer: "Jane Smith",
    date: "2024-09-12",
    status: "Preparing for Shipment",
    statusColor: "bg-green-500/20 text-green-500 border-green-500/30",
  },
  {
    id: "#1247",
    customer: "Mike Johnson",
    date: "2024-09-13",
    status: "Processing",
    statusColor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  {
    id: "#1248",
    customer: "Sarah Williams",
    date: "2024-09-14",
    status: "Preparing for Shipment",
    statusColor: "bg-green-500/20 text-green-500 border-green-500/30",
  },
]

export default function PendingOrders() {
  return (
    <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
      <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-3 backdrop-blur-md bg-white/5 border-b border-white/10">
        <CardTitle className="text-white text-lg">Pending Orders</CardTitle>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm border border-white/10">
            <Filter size={16} className="text-gray-300" />
          </button>
          <Select defaultValue="monthly">
            <SelectTrigger className="w-32 bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/10 backdrop-blur-2xl border-white/10">
              <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
              <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
              <SelectItem value="daily" className="text-white">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">
                  Customer Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">
                  Order Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-300 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/10 hover:bg-white/5 backdrop-blur-sm transition-colors">
                  <td className="py-3 px-4 text-sm text-white">{order.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{order.customer}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{order.date}</td>
                  <td className="py-3 px-4">
                    <Badge className={order.statusColor}>{order.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

