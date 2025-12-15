"use client"

import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface ServiceFiltersProps {
  filters: {
    status: string
    technician: string
    priority: string
  }
  onFiltersChange: (filters: any) => void
}

export default function ServiceFilters({ filters, onFiltersChange }: ServiceFiltersProps) {
  const hasActiveFilters = filters.status !== "all" || filters.technician !== "all" || filters.priority !== "all"

  const clearFilters = () => {
    onFiltersChange({
      status: "all",
      technician: "all",
      priority: "all",
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-7 text-gray-600 hover:text-gray-900"
          >
            <X size={14} className="mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by vehicle, customer, or service ID..."
            className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-full md:w-[180px] h-10 border-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="pending-pickup">Pending Pickup</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>

        {/* Technician Filter */}
        <Select
          value={filters.technician}
          onValueChange={(value) => onFiltersChange({ ...filters, technician: value })}
        >
          <SelectTrigger className="w-full md:w-[180px] h-10 border-gray-200">
            <SelectValue placeholder="Technician" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technicians</SelectItem>
            <SelectItem value="tech-1">Priya Sharma</SelectItem>
            <SelectItem value="tech-2">Dev Mehta</SelectItem>
            <SelectItem value="tech-3">Kumar Reddy</SelectItem>
            <SelectItem value="tech-4">Raj Patel</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority}
          onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}
        >
          <SelectTrigger className="w-full md:w-[180px] h-10 border-gray-200">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

