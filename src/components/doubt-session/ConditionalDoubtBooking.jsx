"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth/useAuth"
import DoubtSessionForm from "@/components/forms/DoubtSessionForm"
import { Lock, Video, Mail, Phone, MessageCircle, CheckCircle, Star, Zap, ArrowRight, History } from "lucide-react"

const PCM_LIVE_DOUBT_PLAN = {
  name: "PCM Live 1:1 Doubt Support",
  type: "live-doubt-solving",
  description: "IITian with under 1500 rank on live VC daily",
  features: [
    "IITian with under 1500 rank",
    "Daily live video calls",
    "Real-time doubt solving",
    "JEE guidance and mentoring",
    "Personalized attention",
  ],
  price: 4499,
  duration: { months: 1 },
  category: "premium",
  planTier: "PREMIUM PLAN",
  supportMode: "live",
}

const AccessDeniedComponent = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleEmailClick = () => {
    window.location.href = "mailto:support@jeeelevate.com"
  }

  const handlePhoneClick = () => {
    window.location.href = "tel:+91-XXXXX-XXXXX"
  }

  const handleWhatsAppClick = () => {
    window.open("https://forms.gle/oh48uFgYH6JwrQB18", "_blank")
  }

  return (
    <div
  className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
>
  <div className="max-w-4xl mx-auto">
    {/* Header Section */}
    <div className="text-center mb-8 sm:mb-12">
      <div className="relative inline-block mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <div className="absolute -inset-2 bg-gradient-to-br from-orange-500/30 via-amber-500/30 to-orange-600/30 rounded-3xl blur-xl"></div>
      </div>

      <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6">Subscription Required</h1>
      <p className="text-base sm:text-xl text-gray-400 max-w-xs sm:max-w-2xl mx-auto leading-relaxed">
        You are not subscribed to this plan. Contact admin to update your plan.
      </p>
    </div>

    {/* Professional Plan Card */}
    <div className="mb-10 sm:mb-16">
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-slate-700/30 w-full max-w-md sm:max-w-4xl mx-auto">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/20 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">{PCM_LIVE_DOUBT_PLAN.name}</h2>
              <p className="text-gray-400 text-sm sm:text-base">{PCM_LIVE_DOUBT_PLAN.description}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white font-semibold text-xs sm:text-sm shadow-lg mb-2">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {PCM_LIVE_DOUBT_PLAN.planTier}
            </div>
            <div className="flex items-center justify-end text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs sm:text-sm">Live Sessions</span>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-baseline space-x-1 sm:space-x-2 mb-1 sm:mb-2">
            <span className="text-3xl sm:text-5xl font-bold text-white">₹{PCM_LIVE_DOUBT_PLAN.price.toLocaleString()}</span>
            <span className="text-base sm:text-xl text-gray-400">/ month</span>
          </div>
          <p className="text-teal-400 font-medium text-base sm:text-lg">Daily VC sessions included</p>
        </div>

        {/* Features Grid - Professional Layout */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {PCM_LIVE_DOUBT_PLAN.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-gray-300 text-sm sm:text-base font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Last feature - full width */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-gray-300 text-sm sm:text-base font-medium">{PCM_LIVE_DOUBT_PLAN.features[4]}</span>
          </div>
        </div>

        {/* Availability Banner */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-3 sm:p-4 border border-blue-500/20">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span className="text-gray-300 text-sm sm:text-base font-medium">Available 24/7 for all PCM subjects</span>
          </div>
        </div>
      </div>
    </div>

    {/* Contact Admin Section */}
    <div className="text-center">
      <button
        onClick={handleWhatsAppClick}
        className="group relative inline-flex items-center px-6 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl text-white font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 relative z-10" />
        <span className="relative z-10">Book your First Free Session</span>
      </button>
    </div>
  </div>
    </div>

  )
}

const ConditionalDoubtBooking = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const checkCurrentSubscription = async () => {
    if (!user) {
      console.log("❌ No user found")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const userId = user._id || user.id
      console.log("🔍 Checking current subscription for user:", userId)

      // Get token from localStorage or cookies
      const token =
        localStorage.getItem("token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]

      if (!token) {
        console.error("❌ No authentication token found")
        setSubscriptionStatus(false)
        setLoading(false)
        return
      }

      // Use the current subscription API route
      const response = await fetch(`/api/subscriptions/current/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("📡 API Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Current subscription data received:", data)

        setCurrentSubscription(data.currentSubscription)
        setSubscriptionStatus(data.hasActivePCMPlan)

        console.log("🎯 Has Active PCM Plan:", data.hasActivePCMPlan)
        console.log("📋 Current Subscription:", data.currentSubscription)
      } else {
        const errorData = await response.json()
        console.error("❌ Subscription check failed:", errorData)
        setError(`Failed to check subscription: ${errorData.error || "Unknown error"}`)
        setSubscriptionStatus(false)
      }
    } catch (error) {
      console.error("❌ Error checking current subscription:", error)
      setError("Failed to check subscription status. Please try again.")
      setSubscriptionStatus(false)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSuccess = () => {
    setBookingSuccess(true)
    // Redirect to session history after 2 seconds
    setTimeout(() => {
      router.push("/student/sessions")
    }, 2000)
  }

  useEffect(() => {
    checkCurrentSubscription()
  }, [user])

  // Debug information in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🐛 Debug Info:")
      console.log("   User:", user)
      console.log("   Subscription Status:", subscriptionStatus)
      console.log("   Current Subscription:", currentSubscription)
      console.log("   Loading:", loading)
      console.log("   Error:", error)
    }
  }, [user, subscriptionStatus, currentSubscription, loading, error])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Checking current subscription...</p>
          {/* {user && <p className="text-gray-500 text-sm mt-2">User ID: {user._id || user.id}</p>} */}
        </div>
      </div>
    )
  }

  // Add error state handling
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                checkCurrentSubscription()
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform duration-300"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === "development" && (
              <div className="text-left bg-slate-800/50 rounded-lg p-4 text-xs text-gray-400">
                <p>
                  <strong>Debug Info:</strong>
                </p>
                <p>User ID: {user?._id || user?.id || "Not found"}</p>
                <p>Token: {localStorage.getItem("token") ? "Present" : "Missing"}</p>
                <p>API Route: /api/subscriptions/current/{user?._id || user?.id}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show booking success message
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Session Booked Successfully!</h2>
          <p className="text-gray-400 mb-6">Redirecting to your session history...</p>
          <div className="flex items-center justify-center text-teal-400">
            <ArrowRight className="w-5 h-5 mr-2 animate-pulse" />
            <span>Going to Session History</span>
          </div>
        </div>
      </div>
    )
  }

  // If user has active PCM Live subscription, show the booking form
  if (subscriptionStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto p-6">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">PCM Live 1:1 Doubt Support Active</h1>
            <p className="text-gray-400">You can now book your doubt session</p>
            {currentSubscription && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-teal-500/20 rounded-full border border-teal-500/30">
                <div className="w-2 h-2 bg-teal-400 rounded-full mr-2"></div>
                <span className="text-teal-300 text-sm font-medium">
                  Plan: {currentSubscription.planName || "PCM Live 1:1 Doubt Support"}
                </span>
              </div>
            )}
          </div>

          {/* Quick access to session history */}
          <div className="mb-6 text-center">
            <button
              onClick={() => router.push("/student/sessions")}
              className="inline-flex items-center px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg text-slate-300 hover:text-white transition-colors duration-200"
            >
              <History className="w-4 h-4 mr-2" />
              View My Session History
            </button>
          </div>

          <DoubtSessionForm onSuccess={handleBookingSuccess} />
        </div>
      </div>
    )
  }

  // If user doesn't have PCM Live subscription, show access denied
  return <AccessDeniedComponent />
}

export default ConditionalDoubtBooking
