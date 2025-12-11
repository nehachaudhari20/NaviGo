"use client"

export default function VehicleCard() {
  const vehicle = {
    id: "mahindra-xev9e",
    name: "Mahindra XEV 9e",
    year: 2024,
    license: "DL-01-AB-0001",
    image: "/mahindra-xev9e.png",
    status: "Excellent",
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{vehicle.name}</h2>
          <p className="text-sm text-muted-foreground">
            Year {vehicle.year} • License: {vehicle.license}
          </p>
        </div>
        <div className="text-right">
          <div className="inline-block px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
            <span className="text-sm font-medium text-green-400">Status: {vehicle.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="glass-card-sm p-4 flex items-center justify-center min-h-48 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 rounded-lg">
            <img
              src={vehicle.image || "/placeholder.svg"}
              alt={vehicle.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card-sm p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Service</p>
              <p className="text-sm font-semibold text-foreground">27 Aug 2024</p>
              <p className="text-xs text-muted-foreground">Oil change & filter replacement</p>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-1">Next Scheduled Service</p>
              <p className="text-sm font-semibold text-foreground">27 Feb 2025</p>
              <p className="text-xs text-muted-foreground">Regular maintenance</p>
            </div>
          </div>

          <div className="glass-card-sm p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Services</span>
              <span className="font-semibold text-foreground">16</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Annual Cost</span>
              <span className="font-semibold text-foreground">$3,567</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Avg Monthly Cost</span>
              <span className="font-semibold text-foreground">$270</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
