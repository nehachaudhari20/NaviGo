"use client"

import { Calendar, Wrench } from "lucide-react"

export default function UpcomingMaintenance() {
  return (
    <div className="glass-card p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Last Service Date */}
        <div className="glass-card p-4 border-border">
          <div className="flex items-start gap-3">
            <Calendar size={20} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Last service date</p>
              <p className="text-2xl font-bold text-foreground">27 - Aug -24</p>
            </div>
          </div>
        </div>

        {/* Total Services */}
        <div className="glass-card p-4 border-border">
          <div className="flex items-start gap-3">
            <Wrench size={20} className="text-accent mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Total Services</p>
              <p className="text-2xl font-bold text-foreground">16</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-border bg-gradient-to-br from-primary/15 to-accent/5">
        <p className="text-xs text-muted-foreground mb-3">Upcoming maintenance</p>
        <div className="inline-block bg-primary/30 border border-primary/50 px-4 py-2 rounded-full mb-4">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-primary" />
            <span className="font-medium text-primary text-sm">Oil change in 5 days</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Replacing the old engine oil and filter helps to keep the engine running smoothly and extend its lifespan.
        </p>

        {/* Service Details */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Estimated cost</p>
            <p className="text-lg font-bold text-foreground">$70</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Provider</p>
            <p className="text-sm font-semibold text-foreground">AutoCare C...</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Due date</p>
            <p className="text-sm font-semibold text-foreground">Sep 15, 2024</p>
          </div>
        </div>
      </div>
    </div>
  )
}
