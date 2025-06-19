"use client"

import { useState, useEffect } from "react"
import { X, Save, AlertCircle, CheckCircle } from "lucide-react"
import Button from "@/components/ui/Button"

export default function StudentInterestModal({ student, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    interestedInPaidSubscription: null,
    interestLevel: "",
    preferredSubscription: "",
    contactPreference: "whatsapp",
    followUpDate: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Load existing interest data
  useEffect(() => {
    console.log("🔄 Loading interest data for student:", student)
    if (student?._id) {
      loadExistingInterest()
    }
  }, [student])

  const loadExistingInterest = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/analytics/users/${student._id}/interest`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("📥 Loaded existing interest data:", data)
        if (data.data) {
          setFormData({
            interestedInPaidSubscription: data.data.interestedInPaidSubscription,
            interestLevel: data.data.interestLevel || "",
            preferredSubscription: data.data.preferredSubscription || "",
            contactPreference: data.data.contactPreference || "whatsapp",
            followUpDate: data.data.followUpDate ? data.data.followUpDate.split("T")[0] : "",
            notes: data.data.notes || "",
          })
        }
      }
    } catch (error) {
      console.error("❌ Error loading existing interest:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validate required field
    if (formData.interestedInPaidSubscription === null) {
      setError("Please select whether the student is interested in paid subscription")
      setLoading(false)
      return
    }

    try {
      console.log("📤 Submitting interest data:", formData)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/analytics/users/${student._id}/interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("📥 Interest update response:", data)

      if (response.ok && data.success) {
        console.log("✅ Interest updated successfully!")
        setSuccess("Interest data updated successfully!")

        // Wait a moment to show success message, then close and refresh
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        setError(data.error || "Failed to update interest")
        console.error("❌ Interest update failed:", data)
      }
    } catch (error) {
      console.error("❌ Error updating interest:", error)
      setError("Failed to update interest")
    } finally {
      setLoading(false)
    }
  }

  const interestLevelOptions = [
    { value: "very-high", label: "Very High Interest" },
    { value: "high", label: "High Interest" },
    { value: "medium", label: "Medium Interest" },
    { value: "low", label: "Low Interest" },
  ]

  const subscriptionOptions = [
    { value: "mentorship-silver", label: "1:1 Mentorship - Silver Plan (₹2000 for 3 months)" },
    { value: "mentorship-gold", label: "1:1 Mentorship - Gold Plan (₹5000 for 6 months)" },
    { value: "doubt-chat", label: "PCM Doubt Solving - Chat Support (₹1500 for 3 months)" },
    { value: "doubt-live", label: "PCM Doubt Solving - Live 1:1 Support (₹4499 for 1 month)" },
  ]

  const contactOptions = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone Call" },
    { value: "no_contact", label: "Do Not Contact" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-200">Update Student Interest</h2>
            <p className="text-slate-400 text-sm mt-1">
              {student?.name} ({student?.email})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center gap-2 text-red-300">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg flex items-center gap-2 text-green-300">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          {/* Interested in Paid Subscription - REQUIRED */}
          <div>
            <label className="block text-slate-300 font-medium mb-3">
              Interested in Paid Subscription? <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="interestedInPaidSubscription"
                  value="true"
                  checked={formData.interestedInPaidSubscription === true}
                  onChange={() => {
                    console.log("🟢 Setting interested to TRUE")
                    setFormData({
                      ...formData,
                      interestedInPaidSubscription: true,
                    })
                  }}
                  className="text-teal-500 focus:ring-teal-500"
                />
                <span className="text-slate-300">Yes, Interested</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="interestedInPaidSubscription"
                  value="false"
                  checked={formData.interestedInPaidSubscription === false}
                  onChange={() => {
                    console.log("🔴 Setting interested to FALSE")
                    setFormData({
                      ...formData,
                      interestedInPaidSubscription: false,
                    })
                  }}
                  className="text-teal-500 focus:ring-teal-500"
                />
                <span className="text-slate-300">No, Not Interested</span>
              </label>
            </div>
            <p className="text-slate-500 text-xs mt-1">This field is required</p>
          </div>

          {/* Show additional fields only if interested */}
          {formData.interestedInPaidSubscription === true && (
            <>
              {/* Interest Level */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">Interest Level</label>
                <select
                  value={formData.interestLevel}
                  onChange={(e) => setFormData({ ...formData, interestLevel: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select interest level</option>
                  {interestLevelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Subscription */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">Preferred Subscription</label>
                <select
                  value={formData.preferredSubscription}
                  onChange={(e) => setFormData({ ...formData, preferredSubscription: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select subscription type</option>
                  {subscriptionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact Preference */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">Contact Preference</label>
                <select
                  value={formData.contactPreference}
                  onChange={(e) => setFormData({ ...formData, contactPreference: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {contactOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Follow-up Date */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* Notes - Always show */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Add any additional notes about the student's interest or requirements..."
              className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400 resize-none"
            />
          </div>

          {/* Current Form Data Debug */}
          {/* <div className="p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400">
            <strong>Debug:</strong> interestedInPaidSubscription = {String(formData.interestedInPaidSubscription)}
          </div> */}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || formData.interestedInPaidSubscription === null}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Interest Data"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
