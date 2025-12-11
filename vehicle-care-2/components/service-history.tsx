"use client"

import { Button } from "@/components/ui/button"

const INTERVENTIONS = [
  {
    date: "10-08-2025",
    type: "Preventive service",
    predicted: "Bearing seal risk",
    outcome: "Avoided breakdown",
    cost: "₹7,200",
    saved: "~₹30K",
  },
  {
    date: "15-07-2025",
    type: "Emergency",
    predicted: "Fuel pump failure",
    outcome: "Tow + 18h downtime",
    cost: "₹38,500",
    saved: null,
  },
  {
    date: "20-06-2025",
    type: "Preventive service",
    predicted: "Brake system wear",
    outcome: "Avoided failure",
    cost: "₹12,500",
    saved: "~₹25K",
  },
  {
    date: "18-05-2025",
    type: "Emergency",
    predicted: "Hydraulic failure",
    outcome: "Tow + 24h downtime",
    cost: "₹42,000",
    saved: null,
  },
  {
    date: "12-04-2025",
    type: "Preventive service",
    predicted: "Transmission issue",
    outcome: "Avoided breakdown",
    cost: "₹15,000",
    saved: "~₹28K",
  },
]

export default function ServiceHistory() {
  return (
    <div className="glass-card p-6">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Intervention history</h2>
        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
          Add intervention
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Predicted issue</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Outcome</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cost</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {INTERVENTIONS.map((intervention, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-primary/5 transition">
                <td className="py-3 px-4 text-foreground">{intervention.date}</td>
                <td className="py-3 px-4 text-foreground">{intervention.type}</td>
                <td className="py-3 px-4 text-foreground text-xs">{intervention.predicted}</td>
                <td className="py-3 px-4 text-foreground text-xs">{intervention.outcome}</td>
                <td className="py-3 px-4 text-foreground font-medium">{intervention.cost}</td>
                <td className="py-3 px-4">
                  {intervention.saved && (
                    <span className="inline-block bg-green-500/20 border border-green-500/50 px-2 py-1 rounded text-xs text-green-400 font-medium">
                      Saved {intervention.saved}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center gap-1 mt-6">
        {[1, 2, 3, 4].map((page) => (
          <button
            key={page}
            className={`px-2 py-1 rounded text-xs transition-all ${
              page === 1
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-primary/10"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  )
}
