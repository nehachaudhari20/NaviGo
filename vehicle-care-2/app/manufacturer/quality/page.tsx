"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ManufacturerSidebar from "@/components/manufacturer/sidebar"
import ManufacturerHeader from "@/components/manufacturer/header"
import DamagedPartsReceived from "@/components/manufacturer/damaged-parts-received"
import CAPAFeedback from "@/components/manufacturer/capa-feedback"
import FailurePatterns from "@/components/manufacturer/failure-patterns"
import WasteOfCost from "@/components/manufacturer/waste-of-cost"
import DefectRates from "@/components/manufacturer/defect-rates"

export default function QualityPage() {
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
              <h1 className="text-3xl font-bold text-white mb-2">Quality & Analysis</h1>
              <p className="text-gray-400 text-sm">Analyze defects, failure patterns, costs, and manage quality improvements</p>
            </div>

            {/* Damaged Parts Received Section - Moved to Top */}
            <div className="mb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">Damaged Parts Received</h2>
                <p className="text-gray-400 text-sm">Parts sent from service centers for defect analysis based on failure patterns</p>
              </div>
              <DamagedPartsReceived />
            </div>

            {/* CAPA Feedback Section - Below Damaged Parts */}
            <div className="mb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">Quality & CAPA Feedback</h2>
                <p className="text-gray-400 text-sm">Root cause analysis and corrective actions from service centers</p>
              </div>
              <CAPAFeedback />
            </div>

            {/* Analytics Section */}
            <div className="mb-6">
              <WasteOfCost />
            </div>

            <div className="grid grid-cols-12 gap-6 mb-6">
              <div className="col-span-5">
                <DefectRates />
              </div>
              <div className="col-span-7">
                <FailurePatterns />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
