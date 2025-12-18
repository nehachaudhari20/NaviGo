"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function TopProduct() {
  return (
    <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
      <CardHeader className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10">
        <CardTitle className="text-white text-lg">Top Product</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-32 h-32 bg-white/5 backdrop-blur-xl rounded-xl flex items-center justify-center mb-4 border border-white/10 shadow-[0_4px_16px_0_rgba(0,0,0,0.2)]">
            <Settings className="text-cyan-400" size={48} />
          </div>
          <p className="text-xl font-bold text-white mb-1 drop-shadow-lg">Cranksets</p>
          <p className="text-lg text-gray-300">5,200 units</p>
        </div>
      </CardContent>
    </Card>
  )
}

