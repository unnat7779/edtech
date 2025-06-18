"use client"

import { useState, useEffect } from "react"
import Button from "@/components/ui/Button"
import { X, MessageCircle } from "lucide-react"

export default function StudentInterestModal({ student, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    interestedInPaidSubscription: null,
    interestLevel: "",
    preferredSubscriptionType: "",
    budgetRange: "",
    contactPreference: "whatsapp",
    notes: "",
    followUpDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Load existing interest data if available
    if (student.interestData) {
      setFormData({
        interestedInPaidSubscription: student.interestData.interestedInPaidSubscription,
        interestLevel: student.interestData.interestLevel || "",
        preferredSubscriptionType: student.interestData.preferredSubscriptionType || "",
        budgetRange: student.interestData.budgetRange || "",
        contactPreference: student.interestData.contactPreference || "whatsapp",
        notes: student.interestData.notes || "",
        followUpDate: student.interestData.followUpDate
          ? new Date(student.interestData.followUpDate).toISOString().split("T")[0]
          : "",
      })
    }
  }, [student])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/analytics/users/${student._id}/interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to update interest")
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-slate-200">Update Student Interest</h2>
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

          {/* Interest in Paid Subscription */}
          <div>
            <label className="block text-slate-300 font-medium mb-3">Interested in Paid Subscription?</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="interestedInPaidSubscription"
                  value="true"
                  checked={formData.interestedInPaidSubscription === true}
                  onChange={(e) => setFormData({ ...formData, interestedInPaidSubscription: true })}
                  className="mr-2 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-slate-300">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="interestedInPaidSubscription"
                  value="false"
                  checked={formData.interestedInPaidSubscription === false}
                  onChange={(e) => setFormData({ ...formData, interestedInPaidSubscription: false })}
                  className="mr-2 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-slate-300">No</span>
              </label>
            </div>
          </div>

          {formData.interestedInPaidSubscription && (
            <>
              {/* Interest Level */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">Interest Level</label>
                <select
                  value={formData.interestLevel}
                  onChange={(e) => setFormData({ ...formData, interestLevel: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select interest level</option>
                  <option value="very_interested">Very Interested</option>
                  <option value="somewhat_interested">Somewhat Interested</option>
                  <option value="maybe_later">Maybe Later</option>
                </select>
              </div>

              {/* Preferred Subscription Type */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">Preferred Subscription</label>
                <select
                  value={formData.preferredSubscriptionType}
                  onChange={(e) => setFormData({ ...formData, preferredSubscriptionType: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select subscription type</option>
                  <option value="basic">Basic Plan</option>
                  <option value="premium">Premium Plan</option>
                  <option value="pro">Pro Plan</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">Budget Range</label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select budget range</option>
                  <option value="under_500">Under ₹500</option>
                  <option value="500_1000">₹500 - ₹1000</option>
                  <option value="1000_2000">₹1000 - ₹2000</option>
                  <option value="2000_plus">₹2000+</option>
                </select>
              </div>

              {/* Contact Preference */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">Contact Preference</label>
                <select
                  value={formData.contactPreference}
                  onChange={(e) => setFormData({ ...formData, contactPreference: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="no_contact">No Contact</option>
                </select>
              </div>

              {/* Follow-up Date */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Add any additional notes about the student's interest or requirements..."
              className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
            />
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
            <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white">
              {loading ? "Updating..." : "Update Interest"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
