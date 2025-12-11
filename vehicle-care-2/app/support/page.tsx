"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import {
  AlertCircle,
  Phone,
  MapPin,
  Car,
  HelpCircle,
  MessageSquare,
  Navigation,
  Clock,
  Zap,
  AlertTriangle,
  Wrench,
  Fuel,
  Hospital,
  Shield,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"

export default function SupportPage() {
  const [activeSupport, setActiveSupport] = useState("emergency")

  const supportSections = [
    { id: "emergency", label: "Emergency", icon: AlertTriangle },
    { id: "onroad", label: "On-Road Help", icon: Navigation },
    { id: "pickup", label: "Car Pickup", icon: Car },
    { id: "faq", label: "FAQ & Help", icon: HelpCircle },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Page Title */}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Support Center</h1>
              <p className="text-muted-foreground">24/7 assistance, roadside help, and service management</p>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {supportSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSupport(section.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                      activeSupport === section.id
                        ? "glass-card bg-primary/30 border-primary text-primary shadow-lg"
                        : "glass-card border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    {section.label}
                  </button>
                )
              })}
            </div>

            {/* EMERGENCY SUPPORT SECTION */}
            {activeSupport === "emergency" && (
              <div className="space-y-6">
                {/* Main Emergency Card */}
                <div className="glass-card p-6 border-destructive/30 bg-gradient-to-br from-destructive/15 to-transparent overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-destructive/10 rounded-full blur-3xl -z-0" />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-destructive/20 p-3 rounded-lg">
                      <AlertCircle size={28} className="text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-foreground mb-1">Immediate Help</h2>
                      <p className="text-muted-foreground mb-1">(24/7 Available)</p>
                      <p className="text-sm text-muted-foreground">Get instant support for urgent situations</p>
                    </div>
                  </div>
                </div>

                {/* Call & Chat Support */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Call Support Card */}
                  <div className="glass-card p-6 border-border hover:border-primary/50 transition">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary/20 p-2.5 rounded-lg">
                        <Phone size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Call Support</h3>
                        <p className="text-xs text-muted-foreground">2 mins average wait</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-4">+91-9876543210</p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition text-sm font-semibold">
                        Call Now
                      </button>
                      <button className="flex-1 border border-primary/50 text-primary px-4 py-2.5 rounded-lg hover:bg-primary/10 transition text-sm font-semibold">
                        Schedule
                      </button>
                    </div>
                  </div>

                  {/* Chat Support Card */}
                  <div className="glass-card p-6 border-border hover:border-accent/50 transition">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-accent/20 p-2.5 rounded-lg">
                        <MessageSquare size={20} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Live Chat</h3>
                        <p className="text-xs text-muted-foreground">Agent online now</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Response in seconds • No wait time</p>
                    <button className="w-full bg-accent text-accent-foreground px-4 py-2.5 rounded-lg hover:bg-accent/90 transition text-sm font-semibold">
                      Start Chat
                    </button>
                  </div>
                </div>

                {/* Roadside Emergency */}
                <div className="glass-card p-6 border-border">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-destructive/20 p-2.5 rounded-lg">
                      <MapPin size={20} className="text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Roadside Emergency</h3>
                      <p className="text-sm text-muted-foreground mt-1">Your location: Pune, Maharashtra</p>
                    </div>
                  </div>
                  <div className="glass-card-sm p-4 bg-primary/10 border-primary/30 mb-4">
                    <p className="text-sm font-semibold text-primary">Nearest service center: 5 km away (10 mins)</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-destructive/20 text-destructive px-4 py-2.5 rounded-lg hover:bg-destructive/30 transition text-sm font-semibold">
                      Get Help on Road
                    </button>
                    <button className="flex-1 border border-primary/50 text-foreground px-4 py-2.5 rounded-lg hover:bg-primary/10 transition text-sm font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ON-ROAD ASSISTANCE SECTION */}
            {activeSupport === "onroad" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="glass-card p-6 border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Roadside Assistance</h2>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock size={16} />
                    <span>Pune-Mumbai highway, KM 45 • Updated 2 minutes ago</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-6 border-border">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-primary" />
                    What to do:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: "Report breakdown/accident", icon: AlertCircle, color: "destructive" },
                      { label: "Request tow truck", icon: Car, color: "primary" },
                      { label: "Get emergency fuel", icon: Fuel, color: "primary" },
                      { label: "Call traffic police", icon: Phone, color: "primary" },
                      { label: "Emergency medical help", icon: Hospital, color: "destructive" },
                    ].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={i}
                          className="glass-card p-4 border-border hover:border-primary/50 transition text-left flex items-center gap-3 group"
                        >
                          <div className={`bg-${item.color}/20 p-2.5 rounded-lg`}>
                            <Icon size={18} className={`text-${item.color}`} />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition">
                            {item.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Nearest Resources */}
                <div className="glass-card p-6 border-border">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    Nearest Resources
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Service Center",
                        address: "123 NH48, Pune",
                        distance: "8 km",
                        time: "15 mins",
                        phone: "020-1234-5678",
                        icon: Wrench,
                        color: "primary",
                      },
                      {
                        name: "Petrol Pump + EV Charging",
                        address: "Shell petrol pump",
                        distance: "2 km",
                        time: "5 mins",
                        phone: "150 kW DC available",
                        icon: Fuel,
                        color: "primary",
                      },
                      {
                        name: "Hospital",
                        address: "Apollo Hospital, Pune",
                        distance: "3 km",
                        time: "8 mins",
                        phone: "Emergency",
                        icon: Hospital,
                        color: "destructive",
                      },
                      {
                        name: "Police Station",
                        address: "Pune Central Station",
                        distance: "4 km",
                        time: "10 mins",
                        phone: "100",
                        icon: Shield,
                        color: "primary",
                      },
                    ].map((resource, i) => {
                      const Icon = resource.icon
                      return (
                        <div
                          key={i}
                          className="glass-card p-4 border-border hover:border-primary/50 transition hover:bg-primary/5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3 flex-1">
                              <div className={`bg-${resource.color}/20 p-2.5 rounded-lg flex-shrink-0`}>
                                <Icon size={18} className={`text-${resource.color}`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground text-sm">{resource.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{resource.address}</p>
                                <p className="text-xs text-muted-foreground mt-1">{resource.phone}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin size={12} />
                                    {resource.distance}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock size={12} />
                                    {resource.time}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button className="bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/30 transition flex-shrink-0">
                              Directions
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Auto-notification info */}
                <div className="glass-card p-4 border-border bg-primary/10 border-primary/30">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Auto-notification enabled</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        If your vehicle stops, our support team will be notified automatically
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CAR PICKUP SECTION */}
            {activeSupport === "pickup" && (
              <div className="space-y-6">
                {/* Service Details Header */}
                <div className="glass-card p-6 border-border bg-accent/10 border-accent/30">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Car Pickup & Drop Service</h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Hours</p>
                      <p className="text-lg font-bold text-foreground">6 AM - 8 PM</p>
                      <p className="text-xs text-muted-foreground mt-1">Weekdays</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cost</p>
                      <p className="text-lg font-bold text-primary">₹0</p>
                      <p className="text-xs text-muted-foreground mt-1">Complimentary</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Coverage
                      </p>
                      <p className="text-lg font-bold text-foreground">15 km</p>
                      <p className="text-xs text-muted-foreground mt-1">From Pune center</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Drop-off
                      </p>
                      <p className="text-lg font-bold text-foreground">Free</p>
                      <p className="text-xs text-muted-foreground mt-1">Return service</p>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="glass-card p-6 border-border space-y-5">
                  <h3 className="font-bold text-lg text-foreground">Schedule a Pickup</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-foreground block mb-2">Pickup Date</label>
                      <input
                        type="date"
                        className="w-full glass-card px-4 py-2.5 rounded-lg border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground block mb-2">
                        Pickup Time (2-hour window)
                      </label>
                      <input
                        type="time"
                        className="w-full glass-card px-4 py-2.5 rounded-lg border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground block mb-3">Pickup Location</label>
                      <div className="flex gap-2">
                        <button className="flex-1 glass-card px-4 py-2.5 rounded-lg border border-primary/50 text-primary text-sm font-medium hover:bg-primary/10 transition">
                          Current Location
                        </button>
                        <button className="flex-1 glass-card px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:border-primary/50 transition">
                          Enter Address
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground block mb-3">Service Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          "Oil change",
                          "Brake pads",
                          "Battery check",
                          "Tyre service",
                          "Full diagnostics",
                          "Other...",
                        ].map((service) => (
                          <label key={service} className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="service" className="w-4 h-4 accent-primary" />
                            <span className="text-sm text-foreground">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground block mb-2">Return Location</label>
                      <div className="flex gap-2">
                        <button className="flex-1 glass-card px-4 py-2.5 rounded-lg border border-primary/50 text-primary text-sm font-medium hover:bg-primary/10 transition">
                          Same as pickup
                        </button>
                        <button className="flex-1 glass-card px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:border-primary/50 transition">
                          Different address
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground block mb-2">Special Instructions</label>
                      <textarea
                        placeholder="Enter any special notes..."
                        className="w-full glass-card px-4 py-2.5 rounded-lg border border-border text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                        rows={3}
                      />
                    </div>

                    <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold text-sm">
                      Schedule Pickup
                    </button>
                  </div>
                </div>

                {/* Past Pickups */}
                <div className="glass-card p-6 border-border">
                  <h3 className="font-bold text-foreground mb-4">Past Pickups</h3>
                  <div className="space-y-2">
                    {[
                      { date: "05 Dec 2025", service: "Oil change", status: "Completed" },
                      { date: "20 Oct 2025", service: "Battery check", status: "Completed" },
                    ].map((pickup, i) => (
                      <div
                        key={i}
                        className="glass-card p-4 border-border flex items-center justify-between hover:border-primary/50 transition"
                      >
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {pickup.date} • {pickup.service}
                          </p>
                        </div>
                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg font-semibold">
                          {pickup.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FAQ SECTION */}
            {activeSupport === "faq" && (
              <div className="space-y-6">
                <div className="glass-card p-6 border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-6">FAQ & Help Center</h2>

                  {/* Search */}
                  <div className="mb-6 relative">
                    <input
                      type="text"
                      placeholder="Search help topics..."
                      className="w-full glass-card px-4 py-3 rounded-lg border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Popular Topics */}
                  <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                    Popular Topics
                  </h3>

                  <div className="space-y-2">
                    {[
                      "How to read error codes",
                      "What does bearing seal degradation mean?",
                      "Battery SOH explained",
                      "How to reduce brake wear",
                      "Tyre rotation schedule",
                      "Warranty coverage details",
                      "How to claim refunds",
                      "Payment issues troubleshooting",
                    ].map((faq, i) => (
                      <button
                        key={i}
                        className="w-full glass-card p-4 border-border hover:border-primary/50 hover:bg-primary/5 transition text-left flex items-center justify-between group"
                      >
                        <span className="font-medium text-foreground text-sm group-hover:text-primary transition">
                          {faq}
                        </span>
                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
