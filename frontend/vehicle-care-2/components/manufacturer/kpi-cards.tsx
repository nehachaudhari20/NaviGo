"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Wrench, TrendingUp, ShoppingBag, Plus } from "lucide-react"

export default function KPICards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total Components Produced */}
      <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
        <CardContent className="relative z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                <Wrench className="text-cyan-400" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-300 mb-1">Total Components Produced</p>
                <p className="text-2xl font-bold text-white drop-shadow-lg">45,320</p>
                <p className="text-xs text-green-500 mt-1">+8% compared to last week</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Efficiency */}
      <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
        <CardContent className="relative z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg"></div>
              </div>
              <div>
                <p className="text-xs text-gray-300 mb-1">Production Efficiency</p>
                <p className="text-2xl font-bold text-white drop-shadow-lg">92%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Orders Fulfilled */}
      <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
        <CardContent className="relative z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-yellow-500" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-300 mb-1">Total Orders Fulfilled</p>
                <p className="text-2xl font-bold text-white drop-shadow-lg">1,230</p>
                <p className="text-xs text-green-500 mt-1">+5% compared to last month</p>
              </div>
            </div>
            <button className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg flex items-center justify-center text-white transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30">
              <Plus size={20} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

