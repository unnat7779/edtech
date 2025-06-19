"use client"
import Button from "@/components/ui/Button"
import {
  X,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  AlertTriangle,
  Shield,
  Award,
  TrendingUp,
  Copy,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"

export default function StudentSubscriptionDetailsModal({ student, onClose, onEdit }) {
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  // Fetch detailed subscription data
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching subscription details for student:", student._id)

        const response = await fetch(`/api/admin/analytics/users/${student._id}/subscription-details`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch subscription details: ${response.status}`)
        }

        const result = await response.json()
        console.log("Subscription details API response:", result)

        if (result.success) {
          setSubscriptionData(result.data)
        } else {
          throw new Error(result.error || "Failed to fetch subscription details")
        }
      } catch (err) {
        console.error("Error fetching subscription details:", err)
        setError(err.message)
        // Fallback to student data if API fails
        setSubscriptionData({
          user: student,
          currentSubscription: student.currentSubscription || null,
          subscriptionHistory: student.subscriptionHistory || [],
          hasActiveSubscription: student.isPremium || false,
          subscriptionStatus: student.isPremium ? "active" : "inactive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (student?._id) {
      fetchSubscriptionDetails()
    }
  }, [student])

  // Calculate subscription status and days remaining using endDate
  const calculateSubscriptionStatus = () => {
    const currentSub = subscriptionData?.currentSubscription

    console.log("Calculating subscription status with data:", currentSub)

    if (!currentSub?.startDate || !currentSub?.endDate) {
      console.log("Missing startDate or endDate:", {
        startDate: currentSub?.startDate,
        endDate: currentSub?.endDate,
      })
      return {
        status: "inactive",
        daysRemaining: 0,
        isExpired: true,
        isActive: false,
        totalDays: 0,
        completedDays: 0,
        progressPercentage: 0,
        expiryDate: null,
        calculatedDuration: "Not set",
      }
    }

    const now = new Date()
    const startDate = new Date(currentSub.startDate)
    const endDate = new Date(currentSub.endDate)

    console.log("Date calculations:", {
      now: now.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })

    // Calculate duration from startDate to endDate
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const timeDiff = endDate.getTime() - now.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    const completedDays = Math.max(0, totalDays - daysRemaining)
    const progressPercentage = totalDays > 0 ? Math.min(100, Math.max(0, (completedDays / totalDays) * 100)) : 0

    // Calculate duration in months and days for display
    const durationInMs = endDate.getTime() - startDate.getTime()
    const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24))

    let calculatedDuration = ""
    if (durationInDays >= 365) {
      const years = Math.floor(durationInDays / 365)
      const remainingDays = durationInDays % 365
      const months = Math.floor(remainingDays / 30)
      calculatedDuration = `${years} year${years > 1 ? "s" : ""}${months > 0 ? ` ${months} month${months > 1 ? "s" : ""}` : ""}`
    } else if (durationInDays >= 30) {
      const months = Math.floor(durationInDays / 30)
      const days = durationInDays % 30
      calculatedDuration = `${months} month${months > 1 ? "s" : ""}${days > 0 ? ` ${days} day${days > 1 ? "s" : ""}` : ""}`
    } else {
      calculatedDuration = `${durationInDays} day${durationInDays > 1 ? "s" : ""}`
    }

    const isExpired = daysRemaining <= 0
    const isActive = !isExpired && daysRemaining > 0

    let status = "inactive"
    if (isActive) {
      status = "active"
    } else if (isExpired) {
      status = "expired"
    }

    console.log("Calculated subscription status:", {
      status,
      daysRemaining,
      isExpired,
      isActive,
      totalDays,
      completedDays,
      progressPercentage,
      calculatedDuration,
    })

    return {
      status,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired,
      isActive,
      startDate,
      expiryDate: endDate,
      totalDays,
      completedDays,
      progressPercentage,
      calculatedDuration,
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateShort = (dateString) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format duration display using calculated duration from dates
  const formatDuration = (duration, calculatedDuration) => {
    console.log("Formatting duration:", { duration, calculatedDuration })

    // If we have a calculated duration from dates, use that
    if (calculatedDuration && calculatedDuration !== "Not set") {
      console.log("Using calculated duration:", calculatedDuration)
      return calculatedDuration
    }

    // Fallback to original duration object if available
    if (!duration) {
      console.log("No duration provided")
      return "Not set"
    }

    if (duration.months && duration.months > 0) {
      const formatted = `${duration.months} month${duration.months > 1 ? "s" : ""}`
      console.log("Formatted duration (months):", formatted)
      return formatted
    } else if (duration.days && duration.days > 0) {
      const formatted = `${duration.days} day${duration.days > 1 ? "s" : ""}`
      console.log("Formatted duration (days):", formatted)
      return formatted
    }

    console.log("Duration has no valid months or days")
    return "Not set"
  }

  // Get the display name for the current plan
  const getPlanDisplayName = (currentSub) => {
    console.log("Getting plan display name for:", currentSub)

    // Priority order: planName > plan > constructed name > fallback
    if (currentSub?.planName) {
      console.log("Using planName:", currentSub.planName)
      return currentSub.planName
    }

    if (currentSub?.plan && currentSub.plan !== "Premium Plan") {
      console.log("Using plan:", currentSub.plan)
      return currentSub.plan
    }

    // Try to construct from type and category
    if (currentSub?.type && currentSub?.category) {
      let constructedName = ""
      if (currentSub.type === "mentorship") {
        constructedName = `1:1 Mentorship - ${currentSub.category.charAt(0).toUpperCase() + currentSub.category.slice(1)} Plan`
      } else if (currentSub.type === "chat-doubt-solving") {
        constructedName = "PCM Chat Doubt Support"
      } else if (currentSub.type === "live-doubt-solving") {
        constructedName = "PCM Live 1:1 Doubt Support"
      } else {
        constructedName = `${currentSub.type} - ${currentSub.category}`
      }
      console.log("Constructed plan name:", constructedName)
      return constructedName
    }

    // Final fallback
    console.log("Using fallback: Premium Plan")
    return "Premium Plan"
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-md">
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">Loading Subscription Details</h3>
            <p className="text-slate-400">Fetching latest subscription information...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !subscriptionData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
            <h2 className="text-xl font-semibold text-slate-100">Error</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-700/50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">Failed to Load Data</h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentSub = subscriptionData?.currentSubscription
  const subscriptionStatus = calculateSubscriptionStatus()
  const planDisplayName = getPlanDisplayName(currentSub)

  // Debug logging
  console.log("Current subscription data:", currentSub)
  console.log("Subscription status:", subscriptionStatus)
  console.log("Plan display name:", planDisplayName)

  // Show free plan modal if no subscription data
  if (!currentSub) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-4xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <Shield className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Subscription Details</h2>
                <p className="text-slate-400 text-sm">
                  {subscriptionData?.user?.name || student.name} • {subscriptionData?.user?.email || student.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => onEdit(subscriptionData?.user || student)}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Subscription
              </Button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-200 mb-2">Free Plan Active</h3>
              <p className="text-slate-400 mb-6">This student is currently on the free plan with basic access.</p>
              <Button
                onClick={() => onEdit(subscriptionData?.user || student)}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium"
              >
                <Award className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
              <Shield className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Subscription Details</h2>
              <p className="text-slate-400 text-sm">
                {subscriptionData?.user?.name || student.name} • {subscriptionData?.user?.email || student.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => onEdit(subscriptionData?.user || student)}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Subscription
            </Button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Debug Information */}
          {/* {error && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                <strong>Debug:</strong> {error} (Using fallback data)
              </p>
            </div>
          )} */}

          {/* Debug Current Subscription Data */}
          {/* <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              <strong>Debug - Current Subscription:</strong>
            </p>
            <pre className="text-xs text-blue-300 mt-2 overflow-auto">{JSON.stringify(currentSub, null, 2)}</pre>
            <p className="text-blue-400 text-sm mt-2">
              <strong>Plan Display Name:</strong> {planDisplayName}
            </p>
          </div> */}

          {/* Premium Plan & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Information */}
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl p-6 border border-slate-600/30">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-slate-100">Premium Plan</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-base">Current Plan:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        planDisplayName.toLowerCase().includes("gold")
                          ? "bg-yellow-500"
                          : planDisplayName.toLowerCase().includes("silver")
                            ? "bg-gray-400"
                            : planDisplayName.toLowerCase().includes("mentorship")
                              ? "bg-blue-500"
                              : planDisplayName.toLowerCase().includes("pcm")
                                ? "bg-green-500"
                                : "bg-purple-500"
                      }`}
                    ></div>
                    <span className="text-slate-100 font-medium text-base">{planDisplayName}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-base">Plan Value:</span>
                  <span className="text-green-400 font-bold text-2xl">₹{currentSub?.amount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-base">Features:</span>
                  <span className="text-slate-200 font-medium text-base">Premium Features</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-base">Duration:</span>
                  <span className="text-slate-200 font-medium text-base">
                    {formatDuration(currentSub?.duration, subscriptionStatus.calculatedDuration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl p-6 border border-slate-600/30">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-slate-100">Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Status:</span>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      subscriptionStatus.isActive
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {subscriptionStatus.isActive ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {subscriptionStatus.isActive ? "Active" : "Expired"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Days Remaining:</span>
                  <span
                    className={`font-bold text-lg ${
                      subscriptionStatus.daysRemaining > 30
                        ? "text-green-400"
                        : subscriptionStatus.daysRemaining > 7
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {subscriptionStatus.daysRemaining} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Progress:</span>
                  <span className="text-slate-300">{Math.round(subscriptionStatus.progressPercentage)}% complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl p-6 border border-slate-600/30">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-100">Payment Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-slate-400 text-sm font-medium">Amount Paid (₹)</label>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                  <span className="text-green-400 text-xl font-bold">₹{currentSub?.amount || 0}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-sm font-medium">Payment ID</label>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30 flex items-center gap-2">
                  <span className="text-slate-200 font-mono text-sm flex-1 truncate">
                    {currentSub?.paymentId || "Not available"}
                  </span>
                  {currentSub?.paymentId && (
                    <button
                      onClick={() => copyToClipboard(currentSub.paymentId)}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-sm font-medium">Start Date</label>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                  <span className="text-slate-200 text-sm">{formatDateShort(currentSub?.startDate)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-sm font-medium">Duration</label>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                  <span className="text-slate-200 font-medium">
                    {formatDuration(currentSub?.duration, subscriptionStatus.calculatedDuration)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expiry Date & Timeline */}
          <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl p-6 border border-slate-600/30">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-slate-100">Subscription Timeline</h3>
            </div>

            {/* Timeline Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Subscription Progress</span>
                <span className="text-slate-300 text-sm">
                  {subscriptionStatus.completedDays} of {subscriptionStatus.totalDays} days
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    subscriptionStatus.isExpired
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : subscriptionStatus.daysRemaining <= 7
                        ? "bg-gradient-to-r from-orange-500 to-red-500"
                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}
                  style={{ width: `${subscriptionStatus.progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Date Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-400 text-sm font-medium">Subscription Started</span>
                </div>
                <p className="text-slate-100 font-medium ml-5">{formatDate(currentSub?.startDate)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${subscriptionStatus.isExpired ? "bg-red-500" : "bg-yellow-500"}`}
                  ></div>
                  <span className="text-slate-400 text-sm font-medium">
                    {subscriptionStatus.isExpired ? "Expired On" : "Expires On"}
                  </span>
                </div>
                <p className={`font-medium ml-5 ${subscriptionStatus.isExpired ? "text-red-400" : "text-slate-100"}`}>
                  {formatDate(subscriptionStatus.expiryDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-slate-600/50 bg-slate-800/30">
          <div className="text-slate-400 text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              className="bg-slate-700 hover:bg-slate-600 text-slate-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {copied && <span className="text-green-400 text-sm font-medium">Copied!</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
