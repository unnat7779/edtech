"use client"

import { X, Star, Phone, Calendar, User, MessageSquare, Award } from "lucide-react"
import { useState, useEffect } from "react"

export default function StudentInterestDetailsModal({ student, onClose }) {
  const [subscriptionPlans, setSubscriptionPlans] = useState([])

  // Fetch subscription plans
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        const response = await fetch("/api/subscriptions/plans")
        const result = await response.json()

        if (result.success) {
          setSubscriptionPlans(result.data)
        }
      } catch (err) {
        console.error("Error fetching subscription plans:", err)
      }
    }

    fetchSubscriptionPlans()
  }, [])

  if (!student?.interestData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-200">Student Interest Details</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-slate-400">No interest data available for this student.</p>
        </div>
      </div>
    )
  }

  const { interestData } = student

  // Find plan details from subscription plans
  const findPlanDetails = (planIdentifier) => {
    if (!subscriptionPlans.length || !planIdentifier) {
      return {
        name: "Not Specified",
        price: 0,
        description: "No plan selected",
        features: [],
        type: "none",
      }
    }

    // Try to match by name, type, or planTier
    const plan = subscriptionPlans.find(
      (p) =>
        p.name?.toLowerCase().includes(planIdentifier?.toLowerCase()) ||
        p.type?.toLowerCase() === planIdentifier?.toLowerCase() ||
        p.planTier?.toLowerCase().includes(planIdentifier?.toLowerCase()) ||
        planIdentifier?.toLowerCase().includes(p.name?.toLowerCase()) ||
        planIdentifier?.toLowerCase().includes(p.type?.toLowerCase()),
    )

    if (plan) {
      return {
        name: plan.name,
        price: plan.price,
        description: plan.description,
        features: plan.features || [],
        type: plan.type,
        duration: plan.duration,
      }
    }

    // Fallback based on common naming patterns
    if (planIdentifier?.toLowerCase().includes("silver")) {
      return {
        name: "1:1 Mentorship - Silver Plan",
        price: 4999,
        description: "3 Months Plan with IITian mentorship",
        features: ["Customized study plan", "24/7 call & chat support"],
        type: "mentorship",
      }
    }
    if (planIdentifier?.toLowerCase().includes("gold")) {
      return {
        name: "1:1 Mentorship - Gold Plan",
        price: 7999,
        description: "6 Months Plan with IITian mentorship",
        features: ["Customized study plan", "24/7 call & chat support", "Extended support"],
        type: "mentorship",
      }
    }

    return {
      name: planIdentifier || "Not Specified",
      price: 0,
      description: "Plan details not available",
      features: [],
      type: "unknown",
    }
  }

  // Helper function to format interest level
  const formatInterestLevel = (level) => {
    if (!level) return "Not Specified"

    const levelMap = {
      "very-high": "Very High Interest",
      high: "High Interest",
      medium: "Medium Interest",
      low: "Low Interest",
      very_interested: "Very Interested",
      somewhat_interested: "Somewhat Interested",
      maybe_later: "Maybe Later",
      not_interested: "Not Interested",
    }

    return levelMap[level] || level
  }

  // Helper function to format subscription type
  const formatSubscription = (subscription) => {
    if (!subscription) return "Not Specified"

    const subscriptionMap = {
      "mentorship-silver": "1:1 Mentorship - Silver Plan",
      "mentorship-gold": "1:1 Mentorship - Gold Plan",
      "doubt-chat": "PCM Doubt Solving - Chat Support",
      "doubt-live": "PCM Doubt Solving - Live 1:1 Support",
      mentorship_silver: "1:1 Mentorship - Silver Plan",
      mentorship_gold: "1:1 Mentorship - Gold Plan",
      doubt_chat_support: "PCM Doubt Solving - Chat Support",
      doubt_live_support: "PCM Doubt Solving - Live 1:1 Support",
    }

    return subscriptionMap[subscription] || subscription
  }

  // Helper function to format contact preference
  const formatContactPreference = (preference) => {
    if (!preference) return "WhatsApp"

    const contactMap = {
      whatsapp: "WhatsApp",
      email: "Email",
      phone: "Phone Call",
      no_contact: "Do Not Contact",
    }

    return contactMap[preference] || preference
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not Set"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Helper function to format last updated
  const formatLastUpdated = (dateString) => {
    if (!dateString) return "Unknown"

    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch (error) {
      return "Unknown"
    }
  }

  // Get preferred plan details
  const preferredPlanDetails = findPlanDetails(interestData.preferredSubscription)

  console.log("🔍 Interest Data Debug:", interestData)
  console.log("🔍 Preferred Plan Details:", preferredPlanDetails)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-200">Student Interest Details</h2>
            <p className="text-slate-400 text-sm mt-1">
              {student.name} ({student.email})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Interest Status */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-slate-200">Interest Status</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Interested in Paid Subscription:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    interestData.interestedInPaidSubscription === true
                      ? "bg-green-900/30 text-green-300 border border-green-700/50"
                      : interestData.interestedInPaidSubscription === false
                        ? "bg-red-900/30 text-red-300 border border-red-700/50"
                        : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                  }`}
                >
                  {interestData.interestedInPaidSubscription === true
                    ? "Yes"
                    : interestData.interestedInPaidSubscription === false
                      ? "No"
                      : "Not Specified"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Interest Level:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    interestData.interestLevel
                      ? "bg-blue-900/30 text-blue-300 border border-blue-700/50"
                      : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                  }`}
                >
                  {formatInterestLevel(interestData.interestLevel)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Preferred Subscription:</span>
                <span className="text-slate-200 font-medium">
                  {formatSubscription(interestData.preferredSubscription)}
                </span>
              </div>
            </div>
          </div>

          {/* Preferred Plan Details */}
        

          {/* Contact Preference */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-5 w-5 text-teal-400" />
              <h3 className="text-lg font-semibold text-slate-200">Contact Preference</h3>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Preferred Method:</span>
              <div className="flex items-center gap-2">
                {interestData.contactPreference === "whatsapp" && <MessageSquare className="h-4 w-4 text-green-400" />}
                <span className="text-slate-200 font-medium">
                  {formatContactPreference(interestData.contactPreference)}
                </span>
              </div>
            </div>
          </div>

          {/* Follow-up Schedule */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-slate-200">Follow-up Schedule</h3>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Follow-up Date:</span>
              <span className="text-slate-200 font-medium">{formatDate(interestData.followUpDate)}</span>
            </div>
          </div>

          {/* Notes */}
          {interestData.notes && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-slate-200">Notes</h3>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-300 leading-relaxed">{interestData.notes}</p>
              </div>
            </div>
          )}

          {/* Debug Information */}
          {/* <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Debug Information:</h4>
            <div className="text-xs text-slate-400 space-y-1">
              <div>Raw Interest Level: "{interestData.interestLevel}"</div>
              <div>Formatted Interest Level: "{formatInterestLevel(interestData.interestLevel)}"</div>
              <div>Preferred Subscription: "{interestData.preferredSubscription}"</div>
              <div>Plan Found: "{preferredPlanDetails.name}"</div>
              <div>Last updated: {formatLastUpdated(interestData.updatedAt)}</div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}
