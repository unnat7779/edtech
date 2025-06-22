"use client"

import { useState, useEffect } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { apiClient } from "@/lib/api-client"

export default function DoubtSessionForm({ user, isAuthenticated }) {
  const [formData, setFormData] = useState({
    preferredTimeSlot: {
      date: "",
      time: "",
    },
    mode: "",
    subject: "",
    topic: "",
    description: "",
  })
  const [userData, setUserData] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userDataLoading, setUserDataLoading] = useState(true)

  // Fetch user data directly from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setUserDataLoading(false)
        return
      }

      try {
        console.log("🔍 Fetching user data from database...")
        const response = await apiClient.get("/api/auth/me")

        if (response.ok) {
          const fetchedUserData = response.data.user
          console.log("✅ User data fetched:", fetchedUserData)
          setUserData(fetchedUserData)
        }
      } catch (error) {
        console.error("❌ Error fetching user data:", error)
      } finally {
        setUserDataLoading(false)
      }
    }

    fetchUserData()
  }, [isAuthenticated])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "date" || name === "time") {
      setFormData((prev) => ({
        ...prev,
        preferredTimeSlot: {
          ...prev.preferredTimeSlot,
          [name]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Only validate session-specific fields
    if (!formData.preferredTimeSlot.date) newErrors.date = "Preferred date is required"
    if (!formData.preferredTimeSlot.time) newErrors.time = "Preferred time is required"
    if (!formData.mode) newErrors.mode = "Session mode is required"
    if (!formData.subject) newErrors.subject = "Subject is required"
    if (!formData.topic.trim()) newErrors.topic = "Topic is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("🚀 Form submission started")
    console.log("📋 Current form data:", formData)

    if (!validateForm()) {
      console.log("❌ Form validation failed:", errors)
      return
    }

    console.log("✅ Form validation passed")

    setLoading(true)
    setErrors({}) // Clear any previous errors

    try {
      // Prepare submission data with explicit structure
      const submissionData = {
        preferredTimeSlot: {
          date: formData.preferredTimeSlot.date,
          time: formData.preferredTimeSlot.time,
        },
        mode: formData.mode,
        subject: formData.subject,
        topic: formData.topic.trim(),
        description: formData.description.trim(),
      }

      console.log("📤 Submitting doubt session with data:", submissionData)

      // Validate data before sending
      if (!submissionData.preferredTimeSlot.date || !submissionData.preferredTimeSlot.time) {
        throw new Error("Date and time are required")
      }
      if (!submissionData.mode || !submissionData.subject || !submissionData.topic || !submissionData.description) {
        throw new Error("All fields are required")
      }

      const response = await apiClient.post("/api/doubt-sessions", submissionData)

      console.log("📨 API Response:", response)

      if (response.ok) {
        console.log("✅ Session booked successfully")
        setSuccess(true)
        // Reset form fields
        setFormData({
          preferredTimeSlot: { date: "", time: "" },
          mode: "",
          subject: "",
          topic: "",
          description: "",
        })
      } else {
        console.log("❌ API Error Response:", response.data)
        setErrors({
          submit: response.data.error || response.data.details || "Booking failed. Please try again.",
        })
      }
    } catch (error) {
      console.error("❌ Booking error:", error)
      setErrors({ submit: error.message || "Booking failed. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-200 mb-4">Session Booked Successfully! 🎉</h3>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          We'll contact you soon on WhatsApp to confirm your doubt session details.
        </p>
        <Button onClick={() => setSuccess(false)} variant="primary">
          Book Another Session
        </Button>
      </div>
    )
  }

  if (userDataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        <span className="ml-3 text-slate-400">Loading your information...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* User Profile Summary - Shows data from database */}
      {isAuthenticated && userData && (
        <div className="mb-8 p-6 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/30">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Booking for: {userData.name || "User"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Class:</span>
              <span className="text-slate-200 font-medium">{userData.class || userData.grade || "Not specified"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">WhatsApp:</span>
              <span className="text-slate-200 font-medium">
                {userData.whatsappNo || userData.phone || "Not provided"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Email:</span>
              <span className="text-slate-200 font-medium">{userData.email || "Not provided"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Coaching:</span>
              <span className="text-slate-200 font-medium">
                {userData.enrolledInCoaching ? userData.coachingName || "Yes" : "No"}
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Your profile information will be used automatically. Just fill in your session details below.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Preferences */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Session Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Preferred Date"
              name="date"
              type="date"
              value={formData.preferredTimeSlot.date}
              onChange={handleChange}
              error={errors.date}
              min={new Date().toISOString().split("T")[0]}
            />

            <Input
              label="Preferred Time"
              name="time"
              type="time"
              value={formData.preferredTimeSlot.time}
              onChange={handleChange}
              error={errors.time}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Session Mode</label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="flex h-11 w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Mode</option>
              <option value="WhatsApp">WhatsApp Call</option>
              <option value="Zoom">Zoom Meeting</option>
              <option value="Google Meet">Google Meet</option>
            </select>
            {errors.mode && <p className="text-sm text-red-400">{errors.mode}</p>}
          </div>
        </div>

        {/* Subject & Topic */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Subject & Topic Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="flex h-11 w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Subject</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
              </select>
              {errors.subject && <p className="text-sm text-red-400">{errors.subject}</p>}
            </div>

            <Input
              label="Specific Topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              error={errors.topic}
              placeholder="e.g., Thermodynamics, Calculus"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Describe Your Doubt</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="flex w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              placeholder="Please describe your doubt in detail. Include any specific questions or concepts you're struggling with..."
            />
            {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
          </div>
        </div>

        {/* Show validation errors */}
        {errors.submit && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              {errors.submit}
            </p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Booking Session...
            </div>
          ) : (
            "Book Doubt Session"
          )}
        </Button>
      </form>
    </div>
  )
}
