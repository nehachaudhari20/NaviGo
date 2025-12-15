"use client"

import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const appointments = [
  {
    id: 3457790,
    appointmentId: "76031847",
    vehicle: "Tata Nexon",
    status: "In-progress",
    statusColor: "bg-orange-100 text-orange-700 border-orange-200",
    contact: "+61488850430",
  },
  {
    id: 37737320,
    appointmentId: "55700223",
    vehicle: "Hyundai i10",
    status: "Active",
    statusColor: "bg-blue-100 text-blue-700 border-blue-200",
    contact: "+61480013910",
  },
  {
    id: 3457791,
    appointmentId: "76031848",
    vehicle: "Mahindra XUV",
    status: "Scheduled",
    statusColor: "bg-green-100 text-green-700 border-green-200",
    contact: "+61488850431",
  },
  {
    id: 37737321,
    appointmentId: "55700224",
    vehicle: "Maruti Swift",
    status: "Completed",
    statusColor: "bg-gray-100 text-gray-700 border-gray-200",
    contact: "+61480013911",
  },
]

export default function ServiceAppointments() {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-gray-800">Delivery</CardTitle>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar size={14} />
          <span>Dec 10, 2022 - July 18, 2023</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Delivery ID</TableHead>
                <TableHead>Fleet ID</TableHead>
                <TableHead>Assigned Fleet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment, index) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{appointment.id}</TableCell>
                  <TableCell className="font-mono text-sm">{appointment.appointmentId}</TableCell>
                  <TableCell>{appointment.vehicle}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${appointment.statusColor} border text-xs px-2 py-0.5`}
                    >
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{appointment.contact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

