"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, ChevronRight, Calendar, Star, CheckCircle2, Clock } from "lucide-react"

const PROVIDERS = [
  {
    name: "Depot #3 – Municipal Workshop",
    address: "Ward 12, Pune",
    slots: "4 slots free tomorrow",
    badges: ["Municipal"],
    color: "from-blue-500 to-blue-600",
    rating: 4.5,
    distance: "2.3 km",
    verified: true,
  },
  {
    name: "Authorized OEM Partner",
    address: "Pimpri-Chinchwad, Pune",
    slots: "2 slots this week",
    badges: ["OEM", "Certified"],
    color: "from-teal-500 to-teal-600",
    rating: 4.8,
    distance: "5.1 km",
    verified: true,
  },
  {
    name: "DriveAIProtect Service Center",
    address: "Baner, Pune",
    slots: "6 slots available",
    badges: ["Partner"],
    color: "from-purple-500 to-purple-600",
    rating: 4.9,
    distance: "3.7 km",
    verified: true,
  },
]

export default function NearbyProviders() {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
              <MapPin className="text-cyan-400" size={22} />
              Preferred Service Centers
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">Find and book services at trusted providers</p>
          </div>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
            See all
            <ChevronRight size={16} className="ml-1" />
          </Button>
      </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
        {PROVIDERS.map((provider, idx) => (
            <Card
            key={idx}
              className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30 hover:border-cyan-500/40 transition-all group cursor-pointer overflow-hidden shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${provider.color} shadow-lg flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                    <MapPin className="text-white relative z-10" size={20} />
                  </div>

                  {/* Content */}
            <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                            {provider.name}
                          </h3>
                          {provider.verified && (
                            <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <MapPin size={12} />
                          <span>{provider.address}</span>
                          <span className="text-slate-600">•</span>
                          <span>{provider.distance}</span>
                        </div>
                      </div>
                    </div>

                    {/* Badges and Info */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                {provider.badges.map((badge, bidx) => (
                        <Badge
                    key={bidx}
                          className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs font-semibold px-2 py-0.5"
                  >
                    {badge}
                        </Badge>
                ))}
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-slate-300">{provider.rating}</span>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="text-green-400" size={14} />
                        <span className="text-green-400 font-semibold">{provider.slots}</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-slate-900 font-semibold text-xs px-4 py-1.5 shadow-lg shadow-cyan-500/20"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">{PROVIDERS.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">12</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Available Slots</div>
              </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">4.7</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Avg Rating</div>
            </div>
          </div>
      </div>
      </CardContent>
    </Card>
  )
}
