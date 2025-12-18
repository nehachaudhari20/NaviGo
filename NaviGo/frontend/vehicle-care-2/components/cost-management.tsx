"use client"

import { DollarSign, TrendingUp } from "lucide-react"

export default function CostManagement() {
  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Fleet metrics</h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3 pb-4 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Savings this year</p>
            <p className="text-2xl font-bold text-foreground">
              ₹9,000<span className="text-sm">/vehicle</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/20 border border-accent/30">
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fleet uptime</p>
            <p className="text-2xl font-bold text-foreground">97%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
