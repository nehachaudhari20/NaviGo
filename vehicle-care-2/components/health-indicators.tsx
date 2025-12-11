"use client"

import Image from "next/image"

export default function HealthIndicators() {
  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Health indicators</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Engine Health */}
        <div className="glass-card-sm p-4 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚙️</span>
            <span className="text-sm font-medium text-foreground">Engine health</span>
          </div>
          <div className="mb-4 flex justify-center">
            <Image src="/engine-health.png" alt="Engine diagram" width={140} height={120} className="object-contain" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Risk level</span>
              <span className="text-xs font-medium text-green-400">Low</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Last anomaly</span>
              <span className="text-foreground">12 days ago</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Next review</span>
              <span className="text-foreground">In 5 days</span>
            </div>
          </div>
        </div>

        {/* Transmission & PTO */}
        <div className="glass-card-sm p-4 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚡</span>
            <span className="text-sm font-medium text-foreground">Transmission & PTO</span>
          </div>
          <div className="mb-4 flex justify-center">
            <Image
              src="/transmission-pto.png"
              alt="Transmission diagram"
              width={140}
              height={120}
              className="object-contain"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Risk level</span>
              <span className="text-xs font-medium text-yellow-400">Medium</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Last anomaly</span>
              <span className="text-foreground">3 days ago</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Next review</span>
              <span className="text-foreground">Tomorrow</span>
            </div>
          </div>
        </div>

        <div className="glass-card-sm p-4 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔋</span>
            <span className="text-sm font-medium text-foreground">Battery</span>
          </div>
          <div className="mb-4 flex justify-center">
            <Image src="/battery-system.png" alt="Battery system" width={140} height={120} className="object-contain" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Risk level</span>
              <span className="text-xs font-medium text-green-400">Low</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Last anomaly</span>
              <span className="text-foreground">25 days ago</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Next review</span>
              <span className="text-foreground">In 8 days</span>
            </div>
          </div>
        </div>

        <div className="glass-card-sm p-4 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🛑</span>
            <span className="text-sm font-medium text-foreground">Tyres & brakes</span>
          </div>
          <div className="mb-4 flex justify-center">
            <Image src="/brake-system.png" alt="Brake system" width={140} height={120} className="object-contain" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Risk level</span>
              <span className="text-xs font-medium text-red-400">High</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Last anomaly</span>
              <span className="text-foreground">2 days ago</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Next review</span>
              <span className="text-foreground">Urgent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
