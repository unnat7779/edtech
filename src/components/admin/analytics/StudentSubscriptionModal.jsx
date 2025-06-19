"use client"

import { useState, useEffect } from "react"
import {
  X,
  CreditCard,
  Crown,
  Star,
  Zap,
  MessageCircle,
  Video,
  IndianRupee,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react"

// Import UI components properly
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

// Create Card components with dark theme
const Card = ({ children, className = "", onClick }) => (
  <div className={`bg-slate-800 rounded-lg shadow-lg border border-slate-700 ${className}`} onClick={onClick}>
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-slate-200 ${className}`}>{children}</h3>
)

const CardContent = ({ children, className = "" }) => <div className={`p-4 pt-0 ${className}`}>{children}</div>

// Enhanced Success Animation Component with After Effects
const SuccessAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1000),
      setTimeout(() => setStage(3), 1500),
      setTimeout(() => setStage(4), 2000),
      setTimeout(() => onComplete?.(), 3500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl max-w-md w-full mx-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 animate-pulse"></div>

        {/* Floating Particles */}
        {stage >= 2 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-green-400 rounded-full animate-bounce opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center relative z-10">
          {/* Main Success Icon */}
          <div
            className={`w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-1000 ${
              stage >= 1 ? "animate-bounce scale-110" : "scale-100"
            }`}
          >
            <CheckCircle className="h-10 w-10 text-white" />
            {stage >= 3 && <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping"></div>}
          </div>

          {/* Success Text */}
          <h3
            className={`text-2xl font-bold text-slate-200 mb-2 transition-all duration-500 ${
              stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Subscription Updated!
          </h3>

          <p
            className={`text-slate-400 mb-4 transition-all duration-500 delay-300 ${
              stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The premium subscription has been successfully updated.
          </p>

          {/* Sparkle Effects */}
          {stage >= 2 && (
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="h-4 w-4 text-yellow-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          )}

          {/* Loading Dots */}
          <div className="flex items-center justify-center space-x-2 text-green-400">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 bg-green-400 rounded-full transition-all duration-300 ${
                  stage >= 1 ? "animate-pulse" : ""
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>

          {/* Completion Message */}
          {stage >= 4 && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg animate-fade-in">
              <p className="text-green-400 text-sm font-medium">✨ All changes have been saved successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading Skeleton for Plan Cards
const PlanCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader className="text-center pb-2">
      <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-2"></div>
      <div className="h-6 bg-slate-700 rounded mx-auto mb-2 w-3/4"></div>
      <div className="h-4 bg-slate-700 rounded mx-auto w-1/2"></div>
    </CardHeader>
    <CardContent className="text-center">
      <div className="h-8 bg-slate-700 rounded mb-2"></div>
      <div className="h-4 bg-slate-700 rounded mb-4 w-2/3 mx-auto"></div>
      <div className="h-16 bg-slate-700 rounded mb-4"></div>
      <div className="h-10 bg-slate-700 rounded"></div>
    </CardContent>
  </Card>
)

export default function StudentSubscriptionModal({ student, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlansLoading, setIsPlansLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPlanDetails, setShowPlanDetails] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const [customDuration, setCustomDuration] = useState({ months: 0 })
  const [subscriptionData, setSubscriptionData] = useState({
    plan: student?.subscription?.plan || "free",
    status: student?.subscription?.status || "inactive",
    startDate: student?.subscription?.startDate || "",
    amount: student?.subscription?.amount || 0,
    paymentId: student?.subscription?.paymentId || "",
    planType: "",
    planTier: "",
  })

  // Fetch subscription plans from database
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      setIsPlansLoading(true)
      try {
        const response = await fetch("/api/subscriptions/plans")
        const result = await response.json()

        if (result.success) {
          setSubscriptionPlans(result.data)
        }
      } catch (err) {
        console.error("Error fetching subscription plans:", err)
      } finally {
        setIsPlansLoading(false)
      }
    }

    fetchSubscriptionPlans()
  }, [])

  // Group plans by type
  const groupedPlans = subscriptionPlans.reduce((acc, plan) => {
    if (!acc[plan.type]) {
      acc[plan.type] = []
    }
    acc[plan.type].push(plan)
    return acc
  }, {})

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
    setCustomDuration({
      months: plan.duration?.months || 0,
    })
    setShowPlanDetails(true)
    setSubscriptionData({
      ...subscriptionData,
      plan: plan.category || plan.type,
      planType: plan.type,
      planTier: plan.planTier,
      amount: plan.price,
    })
  }

  const handleSave = async () => {
    if (!selectedPlan) {
      alert("Please select a subscription plan")
      return
    }

    // Validate required fields before sending
    const missingFields = []
    if (!subscriptionData.amount || subscriptionData.amount <= 0) missingFields.push("Amount Paid")
    if (!subscriptionData.startDate) missingFields.push("Start Date")
    if (!customDuration.months || customDuration.months <= 0) missingFields.push("Plan Duration")

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n• ${missingFields.join("\n• ")}`)
      return
    }

    setIsLoading(true)
    try {
      console.log("Sending subscription data:", {
        ...subscriptionData,
        selectedPlan: {
          ...selectedPlan,
          duration: customDuration,
        },
        customDuration,
      })

      const response = await fetch(`/api/admin/analytics/users/${student._id}/subscription`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...subscriptionData,
          selectedPlan: {
            ...selectedPlan,
            duration: customDuration,
          },
          customDuration,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setShowSuccessAnimation(true)
        // Extended timeout to show full animation
        setTimeout(() => {
          onUpdate?.(result)
          onClose()
        }, 4000)
      } else {
        // Show user-friendly error message
        const errorMessage = result.details
          ? `${result.error}\n\nDetails: ${result.details}`
          : result.error || "Failed to update subscription"

        alert(errorMessage)
      }
    } catch (error) {
      console.error("Error updating subscription:", error)
      alert("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanColor = (category) => {
    switch (category?.toLowerCase()) {
      case "silver":
        return {
          color: "from-slate-500 to-slate-600",
          borderColor: "border-slate-500",
          bgColor: "bg-slate-700/50",
          textColor: "text-slate-200",
          buttonColor: "bg-slate-600 hover:bg-slate-500",
        }
      case "gold":
        return {
          color: "from-yellow-500 to-yellow-600",
          borderColor: "border-yellow-500",
          bgColor: "bg-yellow-900/20",
          textColor: "text-yellow-200",
          buttonColor: "bg-yellow-600 hover:bg-yellow-500",
        }
      case "premium":
        return {
          color: "from-purple-500 to-purple-600",
          borderColor: "border-purple-500",
          bgColor: "bg-purple-900/20",
          textColor: "text-purple-200",
          buttonColor: "bg-purple-600 hover:bg-purple-500",
        }
      default:
        return {
          color: "from-teal-500 to-teal-600",
          borderColor: "border-teal-500",
          bgColor: "bg-teal-900/20",
          textColor: "text-teal-200",
          buttonColor: "bg-teal-600 hover:bg-teal-500",
        }
    }
  }

  const PlanCard = ({ plan }) => {
    const colors = getPlanColor(plan.category)

    return (
      <Card
        className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${colors.borderColor} ${colors.bgColor} hover:border-opacity-80`}
        onClick={() => handlePlanSelect(plan)}
      >
        <CardHeader className="text-center pb-2">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${colors.color} text-white mx-auto mb-3 shadow-lg`}
          >
            {plan.category === "silver" && <Crown className="h-8 w-8" />}
            {plan.category === "gold" && <Star className="h-8 w-8" />}
            {(plan.category === "premium" ||
              plan.type === "chat-doubt-solving" ||
              plan.type === "live-doubt-solving") && <Zap className="h-8 w-8" />}
            {plan.type === "mentorship" && <Crown className="h-8 w-8" />}
          </div>
          <CardTitle className={`text-lg font-bold ${colors.textColor} mb-2`}>{plan.name}</CardTitle>
          {plan.planTier && (
            <div
              className={`text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r ${colors.color} text-white inline-block shadow-sm`}
            >
              {plan.planTier}
            </div>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <div className={`text-3xl font-bold ${colors.textColor} flex items-center justify-center mb-1`}>
              <IndianRupee className="h-6 w-6" />
              {plan.price.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">
              for{" "}
              {plan.duration?.months
                ? `${plan.duration.months} month${plan.duration.months > 1 ? "s" : ""}`
                : plan.duration?.days
                  ? `${plan.duration.days} days`
                  : "duration not set"}
            </div>
          </div>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed line-clamp-3 min-h-[60px]">{plan.description}</p>
          <Button
            className={`w-full ${colors.buttonColor} text-white transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            Select Plan
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!student) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
            <div>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Update Premium Subscription
              </CardTitle>
              <p className="text-slate-400 text-sm mt-1">
                {student.name} • {student.email}
              </p>
            </div>
            <Button onClick={onClose} className="text-slate-400 hover:text-slate-200 hover:bg-slate-700 px-2 py-1">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            {!showPlanDetails ? (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-200 mb-2">Available Subscription Plans</h2>
                  <p className="text-slate-400 text-lg">Choose the perfect plan for your learning journey</p>
                </div>

                {isPlansLoading ? (
                  <div className="space-y-8">
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner size="lg" />
                      <span className="ml-3 text-slate-400">Loading subscription plans...</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[...Array(4)].map((_, i) => (
                        <PlanCardSkeleton key={i} />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Updated Layout: Mentorship Plans (Silver & Gold side by side), then Chat & Live side by side */
                  <div className="space-y-12 max-w-6xl mx-auto">
                    {/* Row 1: Mentorship Plans */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 justify-center">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                          <Crown className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-slate-200">Mentorship Plans</h3>
                          <p className="text-slate-400">Personalized mentorship with IITian experts</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {groupedPlans.mentorship?.map((plan) => (
                          <PlanCard key={plan._id} plan={plan} />
                        ))}
                      </div>
                    </div>

                    {/* Row 2: Chat Doubt-Solving and Live Doubt-Solving Plans */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Chat Doubt-Solving Plans */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                            <MessageCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-200">Chat Doubt-Solving Plans</h3>
                            <p className="text-slate-400 text-sm">Expert doubt resolution via chat</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {groupedPlans["chat-doubt-solving"]?.map((plan) => (
                            <PlanCard key={plan._id} plan={plan} />
                          ))}
                        </div>
                      </div>

                      {/* Live Doubt-Solving Plans */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <Video className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-200">Live Doubt-Solving Plans</h3>
                            <p className="text-slate-400 text-sm">Live 1:1 doubt solving sessions</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {groupedPlans["live-doubt-solving"]?.map((plan) => (
                            <PlanCard key={plan._id} plan={plan} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Plan Details Form */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-200">Subscription Details</h3>
                  <Button
                    onClick={() => setShowPlanDetails(false)}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 transition-colors"
                  >
                    ← Back to Plans
                  </Button>
                </div>

                {/* Selected Plan Summary - Fixed Header */}
                {selectedPlan && (
                  <div
                    className={`p-6 rounded-xl border-2 ${getPlanColor(selectedPlan.category).borderColor} ${getPlanColor(selectedPlan.category).bgColor} shadow-lg`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-r ${getPlanColor(selectedPlan.category).color} text-white shadow-lg`}
                      >
                        {selectedPlan.category === "silver" && <Crown className="h-6 w-6" />}
                        {selectedPlan.category === "gold" && <Star className="h-6 w-6" />}
                        {(selectedPlan.category === "premium" ||
                          selectedPlan.type === "chat-doubt-solving" ||
                          selectedPlan.type === "live-doubt-solving") && <Zap className="h-6 w-6" />}
                        {selectedPlan.type === "mentorship" && <Crown className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className={`text-xl font-bold ${getPlanColor(selectedPlan.category).textColor}`}>
                          {selectedPlan.name}
                        </h4>
                        {selectedPlan.planTier && (
                          <span
                            className={`text-sm px-3 py-1 rounded-full bg-gradient-to-r ${getPlanColor(selectedPlan.category).color} text-white shadow-sm`}
                          >
                            {selectedPlan.planTier}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-3xl font-bold ${getPlanColor(selectedPlan.category).textColor} flex items-center mb-2`}
                    >
                      <IndianRupee className="h-6 w-6" />
                      {subscriptionData.amount?.toLocaleString() || selectedPlan.price?.toLocaleString()}
                      <span className="text-base font-normal text-slate-400 ml-3">
                        for{" "}
                        {customDuration.months
                          ? `${customDuration.months} month${customDuration.months > 1 ? "s" : ""} (${customDuration.months * 30} days)`
                          : "custom duration"}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{selectedPlan.description}</p>
                  </div>
                )}

                {/* Editable Form Fields with Validation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-slate-300 text-sm font-medium block mb-2">
                      Amount Paid (₹) <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="number"
                      value={subscriptionData.amount}
                      onChange={(e) => setSubscriptionData({ ...subscriptionData, amount: Number(e.target.value) })}
                      className={`bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 h-12 ${
                        !subscriptionData.amount || subscriptionData.amount <= 0 ? "border-red-500" : ""
                      }`}
                      placeholder="Enter amount paid"
                      min="1"
                      required
                    />
                    {(!subscriptionData.amount || subscriptionData.amount <= 0) && (
                      <span className="text-red-400 text-xs mt-1">Amount is required</span>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm font-medium block mb-2">Payment ID</label>
                    <Input
                      type="text"
                      value={subscriptionData.paymentId}
                      onChange={(e) => setSubscriptionData({ ...subscriptionData, paymentId: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 h-12"
                      placeholder="Enter payment transaction ID (optional)"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm font-medium block mb-2">
                      Start Date <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="date"
                      value={subscriptionData.startDate}
                      onChange={(e) => setSubscriptionData({ ...subscriptionData, startDate: e.target.value })}
                      className={`bg-slate-700 border-slate-600 text-slate-200 h-12 ${
                        !subscriptionData.startDate ? "border-red-500" : ""
                      }`}
                      required
                    />
                    {!subscriptionData.startDate && (
                      <span className="text-red-400 text-xs mt-1">Start date is required</span>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm font-medium block mb-2">
                      Plan Duration <span className="text-red-400">*</span>
                    </label>
                    <div>
                      <Input
                        type="number"
                        value={customDuration.months}
                        onChange={(e) => setCustomDuration({ months: Number(e.target.value) || 0 })}
                        className={`bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 h-12 ${
                          !customDuration.months || customDuration.months <= 0 ? "border-red-500" : ""
                        }`}
                        placeholder="Enter months"
                        min="1"
                        required
                      />
                      <span className="text-xs text-slate-400 mt-1 block">
                        Months (Days will be calculated automatically: {customDuration.months * 30} days)
                      </span>
                      {(!customDuration.months || customDuration.months <= 0) && (
                        <span className="text-red-400 text-xs">Duration is required</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {showPlanDetails && (
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-700 mt-8">
                <Button
                  onClick={onClose}
                  className="border border-slate-600 text-slate-300 hover:bg-slate-700 px-6 py-3 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-6 py-3 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Save Subscription
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Success Animation */}
      {showSuccessAnimation && <SuccessAnimation onComplete={() => setShowSuccessAnimation(false)} />}
    </>
  )
}
