"use client"

import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"

export default function SubscriptionHistoryCard({ subscription, onViewDetails, onDownloadInvoice }) {
  // Validate subscription data before rendering
  const isValidSubscription = (sub) => {
    // Check if essential fields exist and are valid
    const hasValidAmount = sub.amount && !isNaN(sub.amount) && sub.amount > 0
    const hasValidPlanName = sub.planName || sub.plan || sub.name
    const hasValidStartDate = sub.startDate && !isNaN(new Date(sub.startDate).getTime())
    const hasValidEndDate = sub.endDate && !isNaN(new Date(sub.endDate).getTime())

    return hasValidAmount && hasValidPlanName && hasValidStartDate && hasValidEndDate
  }

  // Don't render if subscription data is invalid
  if (!isValidSubscription(subscription)) {
    console.log("Invalid subscription data, not rendering:", subscription)
    return null
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  const formatCurrency = (amount) => {
    try {
      const numAmount = Number(amount)
      if (isNaN(numAmount)) {
        return "₹0"
      }
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
      }).format(numAmount)
    } catch (error) {
      return "₹0"
    }
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          icon: CheckCircle,
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
          label: "Active",
          dotColor: "bg-emerald-400",
        }
      case "expired":
        return {
          icon: XCircle,
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/20",
          label: "Expired",
          dotColor: "bg-red-400",
        }
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/20",
          label: "Cancelled",
          dotColor: "bg-gray-400",
        }
      case "pending":
        return {
          icon: Clock,
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          label: "Pending",
          dotColor: "bg-amber-400",
        }
      default:
        return {
          icon: AlertTriangle,
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/20",
          label: "Unknown",
          dotColor: "bg-gray-400",
        }
    }
  }

  const getRemainingDays = () => {
    if (subscription.status !== "active") return null

    try {
      const endDate = new Date(subscription.endDate)
      if (isNaN(endDate.getTime())) return null

      const now = new Date()
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
      return daysLeft > 0 ? daysLeft : 0
    } catch (error) {
      return null
    }
  }

  const getProgressPercentage = () => {
    if (subscription.status !== "active") return 0

    try {
      const startDate = new Date(subscription.startDate)
      const endDate = new Date(subscription.endDate)

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0

      const now = new Date()
      const total = endDate - startDate
      const elapsed = now - startDate
      return Math.max(0, Math.min(100, (elapsed / total) * 100))
    } catch (error) {
      return 0
    }
  }

  const statusConfig = getStatusConfig(subscription.status)
  const StatusIcon = statusConfig.icon
  const remainingDays = getRemainingDays()
  const progressPercentage = getProgressPercentage()

  // Get plan name with fallback
  const planName = subscription.planName || subscription.plan || subscription.name || "Unknown Plan"

  return (
    <Card
      className="group bg-slate-800/30 backdrop-blur-sm border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20 hover:bg-slate-800/50 cursor-pointer"
      onClick={() => onViewDetails(subscription)}
    >
      <CardContent className="p-6">
        {/* Header with Status */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-300 transition-colors duration-200 truncate">
              {planName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="capitalize">{subscription.type || "subscription"}</span>
              <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
              <span className="capitalize">{subscription.category || "general"}</span>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}
          >
            <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
            <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
          </div>
        </div>

        {/* Amount and Time Left */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-2xl font-bold text-teal-400 group-hover:text-teal-300 transition-colors duration-200">
              {formatCurrency(subscription.amount)}
            </div>
          </div>
          {remainingDays !== null && (
            <div className="text-right">
              <div
                className={`text-lg font-semibold ${
                  remainingDays <= 7 ? "text-orange-400" : remainingDays <= 30 ? "text-yellow-400" : "text-slate-300"
                }`}
              >
                {remainingDays > 0 ? `${remainingDays} days left` : "Expired"}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar for Active Subscriptions */}
        {subscription.status === "active" && (
          <div className="mb-6">
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500 group-hover:from-teal-400 group-hover:to-emerald-400"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Dates Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-500 mb-1">Purchase Date</div>
            <div className="text-slate-300 font-medium">{formatDate(subscription.startDate)}</div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Expiry Date</div>
            <div className="text-slate-300 font-medium">{formatDate(subscription.endDate)}</div>
          </div>
        </div>

        {/* Payment ID (if available) */}
        {subscription.paymentId && subscription.paymentId !== "NA" && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="text-slate-500 text-xs mb-1">Payment ID</div>
            <div className="text-slate-400 font-mono text-xs">{subscription.paymentId}</div>
          </div>
        )}

        {/* Hover Indicator */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </CardContent>
    </Card>
  )
}
