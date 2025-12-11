"use client"

import { MapPin, ChevronRight } from "lucide-react"

const PROVIDERS = [
  {
    name: "Depot #3 – Municipal Workshop",
    address: "Ward 12, Pune",
    slots: "4 slots free tomorrow",
    badges: ["Municipal"],
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Authorized OEM Partner",
    address: "Pimpri-Chinchwad, Pune",
    slots: "2 slots this week",
    badges: ["OEM", "Certified"],
    color: "from-teal-500 to-teal-600",
  },
  {
    name: "DriveAIProtect Service Center",
    address: "Baner, Pune",
    slots: "6 slots available",
    badges: ["Partner"],
    color: "from-purple-500 to-purple-600",
  },
]

export default function NearbyProviders() {
  return (
    <div className="glass-card p-6">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Preferred service centers</h2>
        <button className="text-primary text-sm font-medium hover:text-accent transition flex items-center gap-1">
          See all <ChevronRight size={16} />
        </button>
      </div>
      <div className="space-y-3">
        {PROVIDERS.map((provider, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 transition cursor-pointer group"
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br ${provider.color} shadow-lg`}></div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm group-hover:text-primary transition">{provider.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin size={12} />
                {provider.address}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {provider.badges.map((badge, bidx) => (
                  <span
                    key={bidx}
                    className="inline-block bg-primary/20 border border-primary/50 px-2 py-0.5 rounded text-xs text-primary font-medium"
                  >
                    {badge}
                  </span>
                ))}
                <span className="text-xs text-green-400 font-medium">{provider.slots}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
