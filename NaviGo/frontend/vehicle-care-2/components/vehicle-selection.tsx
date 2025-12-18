"use client"
import { useState } from "react"

const VEHICLES = [
  { id: "veh-1021", name: "VEH-1021", subtitle: "Compactor Truck", image: "/waste-truck-1.jpg" },
  { id: "veh-2847", name: "VEH-2847", subtitle: "Compactor Truck", image: "/waste-truck-2.jpg" },
  { id: "veh-3390", name: "VEH-3390", subtitle: "Sweeper", image: "/waste-truck-3.jpg" },
]

export default function VehicleSelection({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const [scrollPosition, setScrollPosition] = useState(0)

  const selectedVehicle = VEHICLES.find((v) => v.id === selected)

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Carousel */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground tracking-wide">Your fleet selection</h3>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {VEHICLES.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => onSelect(vehicle.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition min-w-fit backdrop-blur-md ${
                selected === vehicle.id
                  ? "bg-primary/30 border border-primary/60 shadow-lg shadow-primary/20"
                  : "border border-border hover:border-primary/50 hover:bg-primary/10"
              }`}
            >
              <div className="w-16 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                <img
                  src={vehicle.image || "/placeholder.svg?height=48&width=64&query=waste-truck"}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-muted-foreground text-center">{vehicle.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Vehicle Detail */}
      {selectedVehicle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass-card-sm p-8 flex items-center justify-center min-h-64 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 relative">
              <div className="absolute top-4 left-4 bg-red-500/20 border border-red-500/50 px-3 py-1 rounded-full text-xs text-red-400 font-medium">
                Status: At risk – Bearing seal
              </div>
              <img
                src={selectedVehicle.image || "/placeholder.svg?height=256&width=400&query=municipal-waste-truck"}
                alt={selectedVehicle.name}
                className="w-full h-full object-cover max-w-sm max-h-64 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {selectedVehicle.name} – {selectedVehicle.subtitle}
              </h2>
              <p className="text-sm text-muted-foreground">Fleet information</p>
            </div>

            <div className="glass-card-sm p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Last preventive service</span>
                <span className="text-foreground font-medium">12 Nov 2025</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtext</span>
                <span className="text-foreground font-medium">Bearing seal + oil change</span>
              </div>
            </div>

            <div className="glass-card-sm p-4 border-primary/40 bg-primary/10">
              <h4 className="text-sm font-semibold text-primary mb-2">Route & Shift</h4>
              <p className="text-xs text-foreground/80">Ward 12 – Morning shift</p>
            </div>

            <div className="glass-card-sm p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Estimated preventive cost</span>
                <span className="text-foreground font-bold">₹7,200</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Emergency cost if ignored</span>
                <span className="text-foreground text-red-400 font-bold">₹45,000+</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Uptime impact</span>
                <span className="text-foreground font-bold">Avoid 24+ hrs downtime</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
