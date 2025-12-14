"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Factory, BarChart3, Package, DollarSign, Car } from "lucide-react"

export default function ManufacturerSidebar() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-20 bg-[#0a0a0a] border-r border-gray-800/50 flex flex-col items-center py-6">
      {/* Navigo Logo */}
      <div className="mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Car className="text-white" size={20} />
        </div>
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-col gap-4 flex-1">
        <Link
          href="/manufacturer"
          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${
            isActive("/manufacturer")
              ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
              : "text-gray-400 hover:bg-gray-800/50 hover:text-cyan-400"
          }`}
          title="Dashboard"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-3 h-3 bg-current rounded-sm"></div>
              <div className="w-3 h-3 bg-current rounded-sm"></div>
              <div className="w-3 h-3 bg-current rounded-sm"></div>
              <div className="w-3 h-3 bg-current rounded-sm"></div>
            </div>
          </div>
        </Link>

        <Link
          href="/manufacturer"
          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${
            false
              ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
              : "text-gray-400 hover:bg-gray-800/50 hover:text-cyan-400"
          }`}
          title="Factory"
        >
          <Factory size={20} />
        </Link>

        <Link
          href="/manufacturer"
          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${
            false
              ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
              : "text-gray-400 hover:bg-gray-800/50 hover:text-cyan-400"
          }`}
          title="Analytics"
        >
          <BarChart3 size={20} />
        </Link>

        <Link
          href="/manufacturer"
          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${
            false
              ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
              : "text-gray-400 hover:bg-gray-800/50 hover:text-cyan-400"
          }`}
          title="Inventory"
        >
          <Package size={20} />
        </Link>

        <Link
          href="/manufacturer"
          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${
            false
              ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
              : "text-gray-400 hover:bg-gray-800/50 hover:text-cyan-400"
          }`}
          title="Finance"
        >
          <DollarSign size={20} />
        </Link>
      </nav>

      {/* Bottom Navigo Icon */}
      <div className="mt-auto">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 transform rotate-45 rounded-sm shadow-lg shadow-cyan-500/20"></div>
      </div>
    </aside>
  )
}

