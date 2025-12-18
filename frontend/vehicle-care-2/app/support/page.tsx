"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Calendar,
  Send,
  Search,
} from "lucide-react"

export default function SupportPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeSupport, setActiveSupport] = useState("emergency")

  const supportSections = [
    { id: "emergency", label: "Emergency", icon: AlertTriangle },
    { id: "onroad", label: "On-Road Help", icon: Navigation },
    { id: "pickup", label: "Car Pickup", icon: Car },
    { id: "faq", label: "FAQ & Help", icon: HelpCircle },
  ]

  return (
    <div className="flex h-screen bg-black text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto p-5 space-y-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-cyan-400 mb-2">Support Center</h1>
              <p className="text-slate-400">24/7 assistance, roadside help, and service management</p>
            </div>

            {/* Support Section Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {supportSections.map((section) => {
                const Icon = section.icon
                return (
                  <Button
                    key={section.id}
                    onClick={() => setActiveSupport(section.id)}
                    variant="outline"
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      activeSupport === section.id
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                        : "bg-slate-800/30 backdrop-blur-sm border-slate-700/30 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400"
                    }`}
                  >
                    <Icon size={18} />
                    {section.label}
                  </Button>
                )
              })}
            </div>

            {/* EMERGENCY SUPPORT SECTION */}
            {activeSupport === "emergency" && (
              <div className="space-y-6">
                {/* Main Emergency Card */}
                <Card className="bg-gradient-to-br from-red-500/20 via-slate-800/40 to-slate-900/40 backdrop-blur-xl border-red-500/30 shadow-2xl shadow-red-500/20 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -z-0" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-500/20 backdrop-blur-sm p-4 rounded-xl border border-red-500/30 shadow-lg">
                        <AlertCircle size={32} className="text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-slate-100 mb-2">Immediate Help</h2>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-3">24/7 Available</Badge>
                        <p className="text-slate-300">Get instant support for urgent situations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Call & Chat Support */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Call Support Card */}
                  <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20 hover:border-cyan-500/40 transition-all">
                    <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-cyan-500/20 backdrop-blur-sm p-3 rounded-lg border border-cyan-500/30">
                          <Phone size={24} className="text-cyan-400" />
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-100 text-lg">Call Support</h3>
                          <p className="text-xs text-slate-400">2 mins average wait</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-cyan-400 mb-6">+91-9876543210</p>
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold">
                          <Phone size={16} className="mr-2" />
                        Call Now
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-semibold"
                        >
                          <Calendar size={16} className="mr-2" />
                        Schedule
                        </Button>
                    </div>
                    </CardContent>
                  </Card>

                  {/* Chat Support Card */}
                  <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20 hover:border-purple-500/40 transition-all">
                    <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-500/20 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30">
                          <MessageSquare size={24} className="text-purple-400" />
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-100 text-lg">Live Chat</h3>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1 text-xs">
                            Agent online now
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mb-6">Response in seconds • No wait time</p>
                      <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold">
                        <MessageSquare size={16} className="mr-2" />
                      Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Roadside Emergency */}
                <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
                  <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                      <div className="bg-red-500/20 backdrop-blur-sm p-3 rounded-lg border border-red-500/30">
                        <MapPin size={24} className="text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-100 text-lg">Roadside Emergency</h3>
                        <p className="text-sm text-slate-400 mt-1">Your location: Pune, Maharashtra</p>
                      </div>
                    </div>
                    <Card className="bg-cyan-500/10 backdrop-blur-sm border-cyan-500/30 mb-4">
                      <CardContent className="p-4">
                        <p className="text-sm font-semibold text-cyan-400">
                          Nearest service center: 5 km away (10 mins)
                        </p>
                      </CardContent>
                    </Card>
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold">
                      Get Help on Road
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-semibold"
                      >
                      View Details
                      </Button>
                  </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ON-ROAD ASSISTANCE SECTION */}
            {activeSupport === "onroad" && (
              <div className="space-y-6">
                {/* Header */}
                <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-2">Roadside Assistance</h2>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock size={16} />
                    <span>Pune-Mumbai highway, KM 45 • Updated 2 minutes ago</span>
                  </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-cyan-400 flex items-center gap-2">
                      <Zap size={20} className="text-cyan-400" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { label: "Report breakdown/accident", icon: AlertCircle, color: "red" },
                        { label: "Request tow truck", icon: Car, color: "cyan" },
                        { label: "Get emergency fuel", icon: Fuel, color: "cyan" },
                        { label: "Call traffic police", icon: Phone, color: "cyan" },
                        { label: "Emergency medical help", icon: Hospital, color: "red" },
                    ].map((item, i) => {
                      const Icon = item.icon
                        const colorClasses =
                          item.color === "red"
                            ? "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                            : "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
                        const iconBgClass = item.color === "red" ? "bg-red-500/20" : "bg-cyan-500/20"
                        const iconTextClass = item.color === "red" ? "text-red-400" : "text-cyan-400"
                      return (
                          <Button
                          key={i}
                            variant="outline"
                            className={`${colorClasses} backdrop-blur-sm p-4 h-auto justify-start text-left group transition-all`}
                        >
                            <div className={`${iconBgClass} p-2.5 rounded-lg mr-3`}>
                              <Icon size={18} className={iconTextClass} />
                          </div>
                            <span className="text-sm font-medium">{item.label}</span>
                          </Button>
                      )
                    })}
                  </div>
                  </CardContent>
                </Card>

                {/* Nearest Resources */}
                <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-cyan-400 flex items-center gap-2">
                      <MapPin size={20} className="text-cyan-400" />
                    Nearest Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                    {[
                      {
                        name: "Service Center",
                        address: "123 NH48, Pune",
                        distance: "8 km",
                        time: "15 mins",
                        phone: "020-1234-5678",
                        icon: Wrench,
                          color: "cyan",
                      },
                      {
                        name: "Petrol Pump + EV Charging",
                        address: "Shell petrol pump",
                        distance: "2 km",
                        time: "5 mins",
                        phone: "150 kW DC available",
                        icon: Fuel,
                          color: "cyan",
                      },
                      {
                        name: "Hospital",
                        address: "Apollo Hospital, Pune",
                        distance: "3 km",
                        time: "8 mins",
                        phone: "Emergency",
                        icon: Hospital,
                          color: "red",
                      },
                      {
                        name: "Police Station",
                        address: "Pune Central Station",
                        distance: "4 km",
                        time: "10 mins",
                        phone: "100",
                        icon: Shield,
                          color: "cyan",
                      },
                    ].map((resource, i) => {
                      const Icon = resource.icon
                        const bgColor = resource.color === "red" ? "bg-red-500/20" : "bg-cyan-500/20"
                        const borderColor = resource.color === "red" ? "border-red-500/30" : "border-cyan-500/30"
                        const textColor = resource.color === "red" ? "text-red-400" : "text-cyan-400"
                      return (
                          <Card
                          key={i}
                            className={`bg-slate-900/30 backdrop-blur-sm border-slate-700/30 hover:border-${resource.color}-500/40 transition-all shadow-md`}
                        >
                            <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3 flex-1">
                                  <div className={`${bgColor} backdrop-blur-sm p-2.5 rounded-lg flex-shrink-0 border ${borderColor}`}>
                                    <Icon size={18} className={textColor} />
                              </div>
                              <div className="flex-1">
                                    <h4 className="font-semibold text-slate-100 text-sm mb-1">{resource.name}</h4>
                                    <p className="text-xs text-slate-400 mb-1">{resource.address}</p>
                                    <p className="text-xs text-slate-400 mb-2">{resource.phone}</p>
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <MapPin size={12} />
                                    {resource.distance}
                                  </div>
                                      <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock size={12} />
                                    {resource.time}
                                  </div>
                                </div>
                              </div>
                            </div>
                                <Button
                                  variant="outline"
                                  className={`${bgColor} ${textColor} ${borderColor} px-3 py-1.5 text-xs font-semibold ${
                                    resource.color === "red" ? "hover:bg-red-500/30" : "hover:bg-cyan-500/30"
                                  } transition flex-shrink-0`}
                                >
                              Directions
                                </Button>
                          </div>
                            </CardContent>
                          </Card>
                      )
                    })}
                  </div>
                  </CardContent>
                </Card>

                {/* Auto-notification info */}
                <Card className="bg-cyan-500/10 backdrop-blur-sm border-cyan-500/30 shadow-md">
                  <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-slate-100">Auto-notification enabled</p>
                        <p className="text-xs text-slate-400 mt-1">
                        If your vehicle stops, our support team will be notified automatically
                      </p>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* CAR PICKUP SECTION */}
            {activeSupport === "pickup" && (
              <div className="space-y-6">
                {/* Service Details Header */}
                <Card className="bg-gradient-to-br from-cyan-500/15 via-slate-800/40 to-slate-900/40 backdrop-blur-xl border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-6">Car Pickup & Drop Service</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hours</p>
                        <p className="text-2xl font-bold text-slate-100">6 AM - 8 PM</p>
                        <p className="text-xs text-slate-400 mt-1">Weekdays</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cost</p>
                        <p className="text-2xl font-bold text-cyan-400">₹0</p>
                        <p className="text-xs text-slate-400 mt-1">Complimentary</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Coverage</p>
                        <p className="text-2xl font-bold text-slate-100">15 km</p>
                        <p className="text-xs text-slate-400 mt-1">From Pune center</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Drop-off</p>
                        <p className="text-2xl font-bold text-green-400">Free</p>
                        <p className="text-xs text-slate-400 mt-1">Return service</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Form */}
                <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-cyan-400">Schedule a Pickup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <label className="text-sm font-semibold text-slate-300 block mb-2">Pickup Date</label>
                      <input
                        type="date"
                        className="w-full bg-slate-900/30 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-slate-700/30 text-slate-100 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-300 block mb-2">
                        Pickup Time (2-hour window)
                      </label>
                      <input
                        type="time"
                        className="w-full bg-slate-900/30 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-slate-700/30 text-slate-100 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-300 block mb-3">Pickup Location</label>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                        >
                          <MapPin size={16} className="mr-2" />
                          Current Location
                        </Button>
                        <Button variant="outline" className="flex-1 border-slate-700/30 hover:border-cyan-500/40">
                          Enter Address
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-300 block mb-3">Service Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Oil change", "Brake pads", "Battery check", "Tyre service", "Full diagnostics", "Other..."].map(
                          (service) => (
                            <label key={service} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="radio"
                                name="service"
                                className="w-4 h-4 accent-cyan-500 cursor-pointer"
                              />
                              <span className="text-sm text-slate-300 group-hover:text-cyan-400 transition">
                                {service}
                              </span>
                          </label>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-300 block mb-2">Return Location</label>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                        >
                          Same as pickup
                        </Button>
                        <Button variant="outline" className="flex-1 border-slate-700/30 hover:border-cyan-500/40">
                          Different address
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-300 block mb-2">Special Instructions</label>
                      <textarea
                        placeholder="Enter any special notes..."
                        className="w-full bg-slate-900/30 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-slate-700/30 text-slate-100 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 resize-none placeholder:text-slate-500"
                        rows={3}
                      />
                    </div>

                    <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-6">
                      <Send size={16} className="mr-2" />
                      Schedule Pickup
                    </Button>
                  </CardContent>
                </Card>

                {/* Past Pickups */}
                <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-cyan-400">Past Pickups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                    {[
                      { date: "05 Dec 2025", service: "Oil change", status: "Completed" },
                      { date: "20 Oct 2025", service: "Battery check", status: "Completed" },
                    ].map((pickup, i) => (
                        <Card
                        key={i}
                          className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30 hover:border-cyan-500/40 transition-all shadow-md"
                      >
                          <CardContent className="p-4 flex items-center justify-between">
                        <div>
                              <p className="font-medium text-slate-100 text-sm">
                            {pickup.date} • {pickup.service}
                          </p>
                        </div>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          {pickup.status}
                            </Badge>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* FAQ SECTION */}
            {activeSupport === "faq" && (
              <div className="space-y-6">
                <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
                  <CardHeader>
                    <CardTitle className="text-2xl text-cyan-400">FAQ & Help Center</CardTitle>
                  </CardHeader>
                  <CardContent>
                  {/* Search */}
                  <div className="mb-6 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search help topics..."
                        className="w-full bg-slate-900/30 backdrop-blur-sm pl-12 pr-4 py-3 rounded-lg border border-slate-700/30 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                    />
                  </div>

                  {/* Popular Topics */}
                    <h3 className="font-semibold text-slate-400 mb-4 text-sm uppercase tracking-wide">
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
                        <Button
                        key={i}
                          variant="outline"
                          className="w-full bg-slate-900/30 backdrop-blur-sm border-slate-700/30 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all text-left justify-between group p-4 h-auto"
                      >
                          <span className="font-medium text-slate-300 text-sm group-hover:text-cyan-400 transition">
                          {faq}
                        </span>
                          <ChevronRight
                            size={16}
                            className="text-slate-400 group-hover:text-cyan-400 transition flex-shrink-0"
                          />
                        </Button>
                    ))}
                  </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
