"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { CreditCard, Wallet, Download, Plus, Trash2, CheckCircle } from "lucide-react"

export default function AccountPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }
  const payments = [
    {
      id: 1,
      method: "Visa",
      last4: "4242",
      expiry: "12/25",
      default: true,
    },
    {
      id: 2,
      method: "Mastercard",
      last4: "5555",
      expiry: "08/26",
      default: false,
    },
  ]

  const transactions = [
    {
      id: 1,
      type: "Service Payment",
      description: "Oil Change at AutoCare Center",
      amount: "-$45",
      date: "Dec 15, 2024",
      status: "completed",
    },
    {
      id: 2,
      type: "Premium Subscription",
      description: "Monthly subscription renewal",
      amount: "-$9.99",
      date: "Dec 1, 2024",
      status: "completed",
    },
    {
      id: 3,
      type: "Refund",
      description: "Refund for cancelled appointment",
      amount: "+$25",
      date: "Nov 28, 2024",
      status: "completed",
    },
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Account</h1>
              <p className="text-muted-foreground">Manage your payment methods and billing information</p>
            </div>

            {/* Account Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">Subscription</h2>
                  <CheckCircle size={24} className="text-accent" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-xl font-bold text-foreground">Premium</p>
                  <p className="text-sm text-muted-foreground mt-4">Renewal Date</p>
                  <p className="text-lg text-foreground font-medium">January 1, 2025</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">Account Balance</h2>
                  <Wallet size={24} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Available Credits</p>
                  <p className="text-2xl font-bold text-foreground">$125.50</p>
                  <button className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition font-medium text-sm flex items-center justify-center gap-2">
                    <Plus size={16} />
                    Add Credits
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Payment Methods</h2>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition font-medium text-sm flex items-center gap-2">
                  <Plus size={16} />
                  Add Card
                </button>
              </div>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {payment.method} •••• {payment.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">Expires {payment.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {payment.default && (
                        <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded">Default</span>
                      )}
                      <button className="p-2 hover:bg-destructive/10 rounded transition">
                        <Trash2 size={18} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Recent Transactions</h2>
                <button className="text-primary hover:text-primary/80 transition font-medium text-sm flex items-center gap-2">
                  <Download size={16} />
                  Export
                </button>
              </div>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          transaction.amount.startsWith("+") ? "text-accent" : "text-foreground"
                        }`}
                      >
                        {transaction.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
