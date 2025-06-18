"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import { X, CreditCard, Crown, MessageCircle, Video } from "lucide-react"

export default function StudentSubscriptionModal({ student, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    subscriptionType: "mentorship-silver",
    amount: "",
    duration: "3",
    paymentId: "",
    startDate: new Date().toISOString().split("T")[0],
    autoRenew: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const subscriptionPlans = [
    {
      value: "mentorship-silver",
      label: "1:1 Mentorship - Silver Plan",
      price: "₹2000",
      duration: "3 months",
      features: [
        "Customized study plan",
        "24/7 call & chat support",
        "Weekly deep strategy analysis",
        "Multiple test analysis",
      ],
      icon: Crown,
      color: "text-gray-400",
    },
    {
      value: "mentorship-gold",
      label: "1:1 Mentorship - Gold Plan",
      price: "₹5000",
      duration: "6 months",
      features: [
        "Customized study plan",
        "24/7 call & chat support",
        "Weekly deep strategy analysis",
        "Multiple test analysis",
      ],
      icon: Crown,
      color: "text-yellow-400",
    },
    {
      value: "doubt-chat",
      label: "PCM Doubt Solving - Chat Support",
      price: "₹1500",
      duration: "3 months",
      features: [
        "IITian doubt experts",
        "WhatsApp/Telegram support",
        "30 min response time",
        "Efficient doubt solving",
      ],
      icon: MessageCircle,
      color: "text-blue-400",
    },
    {
      value: "doubt-live",
      label: "PCM Doubt Solving - Live 1:1 Support",
      price: "₹4499",
      duration: "1 month",
      features: ["IITian with under 1500 rank", "Daily live VC sessions", "Test doubt solving", "JEE guidance"],
      icon: Video,
      color: "text-purple-400",
    },
  ]

  const selectedPlan = subscriptionPlans.find((plan) => plan.value === formData.subscriptionType)

  const handlePlanChange = (planValue) => {
    const plan = subscriptionPlans.find((p) => p.value === planValue)
    setFormData({
      ...formData,
      subscriptionType: planValue,
      amount: plan.price.replace("₹", ""),
      duration: plan.duration.includes("month") ? plan.duration.split(" ")[0] : "1",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/analytics/users/${student._id}/subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: Number.parseFloat(formData.amount),
          duration: Number.parseInt(formData.duration),
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to update subscription")
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-green-400" />
            <div>
              <h2 className="text-xl font-semibold text-slate-200">Update Premium Subscription</h2>
              <p className="text-slate-400 text-sm">
                {student.name} - {student.email}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700/50 text-red-300 rounded-lg text-sm">{error}</div>
          )}

          {/* Current Status */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
            <h3 className="text-slate-200 font-medium mb-2">Current Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Subscription</p>
                <p className="text-slate-300">{student.isPremium ? `${student.premiumTier} Plan` : "Free Plan"}</p>
              </div>
              <div>
                <p className="text-slate-400">Status</p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    student.isPremium ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"
                  }`}
                >
                  {student.isPremium ? "Active" : "Free"}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div>
            <label className="block text-slate-300 font-medium mb-4">Select Premium Plan</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptionPlans.map((plan) => {
                const IconComponent = plan.icon
                return (
                  <div
                    key={plan.value}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.subscriptionType === plan.value
                        ? "border-teal-500 bg-teal-500/10"
                        : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                    }`}
                    onClick={() => handlePlanChange(plan.value)}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className={`h-5 w-5 ${plan.color} mt-1`} />
                      <div className="flex-1">
                        <h4 className="text-slate-200 font-medium text-sm">{plan.label}</h4>
                        <p className="text-slate-400 text-xs mb-2">
                          {plan.price} for {plan.duration}
                        </p>
                        <ul className="space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="text-slate-400 text-xs flex items-center gap-1">
                              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {formData.subscriptionType === plan.value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Plan Details */}
          {selectedPlan && (
            <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 rounded-lg p-4 border border-teal-700/30">
              <h4 className="text-teal-300 font-medium mb-2">Selected Plan Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Plan</p>
                  <p className="text-slate-200">{selectedPlan.label}</p>
                </div>
                <div>
                  <p className="text-slate-400">Price</p>
                  <p className="text-slate-200">{selectedPlan.price}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-2">Amount Paid (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount paid"
                required
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">Payment ID</label>
              <input
                type="text"
                value={formData.paymentId}
                onChange={(e) => setFormData({ ...formData, paymentId: e.target.value })}
                placeholder="Enter payment transaction ID"
                required
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">Duration</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Duration in months"
                min="1"
                required
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Auto Renew */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoRenew}
                onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                className="mr-2 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-slate-300">Enable auto-renewal</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? "Updating..." : "Update Subscription"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
