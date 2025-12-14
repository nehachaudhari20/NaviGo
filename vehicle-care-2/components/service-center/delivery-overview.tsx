"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const deliveryData = [
  { period: "Jan", completed: 15, pending: 5 },
  { period: "Feb", completed: 18, pending: 4 },
  { period: "Mar", completed: 20, pending: 6 },
  { period: "Apr", completed: 22, pending: 5 },
  { period: "May", completed: 25, pending: 3 },
  { period: "Jun", completed: 23, pending: 4 },
  { period: "Jul", completed: 26, pending: 5 },
  { period: "Aug", completed: 28, pending: 2 },
]

export default function DeliveryOverview() {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-gray-800">Delivery Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deliveryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="period" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                domain={[0, 30]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#fff", 
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              />
              <Bar dataKey="completed" stackId="a" fill="#3b82f6" name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="#93c5fd" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

