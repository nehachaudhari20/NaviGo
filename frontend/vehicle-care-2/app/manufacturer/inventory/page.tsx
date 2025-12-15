"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ManufacturerSidebar from "@/components/manufacturer/sidebar"
import ManufacturerHeader from "@/components/manufacturer/header"
import CurrentStock from "@/components/manufacturer/current-stock"
import PendingOrders from "@/components/manufacturer/pending-orders"
import TopProduct from "@/components/manufacturer/top-product"

export default function InventoryPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    if (user?.persona !== "manufacturer") {
      if (user?.persona === "customer") {
        router.push("/")
      } else if (user?.persona === "service") {
        router.push("/service-center")
      } else {
        router.push("/login")
      }
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.persona !== "manufacturer") {
    return null
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-black text-white overflow-hidden">
      <ManufacturerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ManufacturerHeader />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-black via-[#0a0a0a] to-black">
          <div className="p-6 lg:p-8 space-y-6 max-w-[1920px] mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
              <p className="text-gray-400 text-sm">Track stock levels, pending orders, and top products</p>
            </div>

            {/* Current Stock */}
            <div className="mb-6">
              <CurrentStock />
            </div>

            {/* Pending Orders & Top Product */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8">
                <PendingOrders />
              </div>
              <div className="col-span-4">
                <TopProduct />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
