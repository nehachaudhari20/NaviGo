"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import ServiceCenterSidebar from "@/components/service-center/sidebar"
import ServiceCenterHeader from "@/components/service-center/header"
import ActiveServicesList from "@/components/service-center/active-services-list"
import ServiceFilters from "@/components/service-center/service-filters"

function ActiveServicesContent() {
  const searchParams = useSearchParams()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    technician: "all",
    priority: "all",
  })

  // Handle URL query parameters from sidebar submenu
  useEffect(() => {
    const statusParam = searchParams?.get("status")
    if (statusParam) {
      setFilters(prev => ({ ...prev, status: statusParam }))
    }
  }, [searchParams])

  return (
    <div className="flex h-screen bg-gray-50">
      <ServiceCenterSidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ServiceCenterHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Active Services</h1>
                  <p className="text-sm text-gray-600">Monitor and manage all active service jobs in real-time</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <Plus size={16} className="mr-2" />
                  New Service
                </Button>
              </div>
            </div>

            {/* Filters */}
            <ServiceFilters filters={filters} onFiltersChange={setFilters} />

            {/* Active Services List */}
            <ActiveServicesList filters={filters} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ActiveServicesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-gray-50">
        <ServiceCenterSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ServiceCenterHeader />
          <main className="flex-1 overflow-auto p-6">
            <div className="animate-pulse">Loading...</div>
          </main>
        </div>
      </div>
    }>
      <ActiveServicesContent />
    </Suspense>
  )
}

