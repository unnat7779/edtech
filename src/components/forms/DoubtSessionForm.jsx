"use client"

import { useState, useEffect } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { apiClient } from "@/lib/api-client"

export default function DoubtSessionForm({ user, isAuthenticated }) {
  const [formData, setFormData] = useState({
    studentName: "",
    studentClass: "",
    whatsappNo: "",
    enrolledInCoaching: false,
    coachingName: "",
    preferredTimeSlot: {
      date: "",
      time: "",
    },
    mode: "",
    subject: "",
    topic: "",
    description: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Auto-populate user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        studentName: user.name || "",
        studentClass: user.class || "",
        whatsappNo: user.whatsappNo || user.phone || "",
      }))
    }
  }, [isAuthenticated, user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

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
        [name]: type === "checkbox" ? checked : value,
      }))
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.studentName.trim()) newErrors.studentName = "Student name is required"
    if (!formData.studentClass) newErrors.studentClass = "Class is required"
    if (!formData.whatsappNo.trim()) newErrors.whatsappNo = "WhatsApp number is required"
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

    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await apiClient.post("/api/doubt-sessions", formData)

      if (response.ok) {
        setSuccess(true)
        // Reset only non-user fields
        setFormData((prev) => ({
          ...prev,
          enrolledInCoaching: false,
          coachingName: "",
          preferredTimeSlot: { date: "", time: "" },
          mode: "",
          subject: "",
          topic: "",
          description: "",
        }))
      } else {
        setErrors({ submit: response.data.error })
      }
    } catch (error) {
      setErrors({ submit: "Booking failed. Please try again." })
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Details Section - Only show if not authenticated */}
      {!isAuthenticated && (
        <div className="space-y-6">
          <div className="border-b border-slate-700 pb-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Student Name"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                error={errors.studentName}
                placeholder="Enter your full name"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Class</label>
                <select
                  name="studentClass"
                  value={formData.studentClass}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select Class</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                  <option value="Dropper">Dropper</option>
                </select>
                {errors.studentClass && <p className="text-sm text-red-400">{errors.studentClass}</p>}
              </div>

              <Input
                label="WhatsApp Number"
                name="whatsappNo"
                value={formData.whatsappNo}
                onChange={handleChange}
                error={errors.whatsappNo}
                placeholder="Enter WhatsApp number"
              />
            </div>
          </div>
        </div>
      )}

      {/* Coaching Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          Coaching Information
        </h3>

        <div className="flex items-center space-x-3 p-4 bg-slate-700 rounded-lg">
          <input
            type="checkbox"
            name="enrolledInCoaching"
            checked={formData.enrolledInCoaching}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-600 rounded bg-slate-700"
          />
          <label className="text-sm text-slate-300">I am enrolled in a coaching institute</label>
        </div>

        {formData.enrolledInCoaching && (
          <Input
            label="Coaching Institute Name"
            name="coachingName"
            value={formData.coachingName}
            onChange={handleChange}
            placeholder="Enter coaching institute name"
          />
        )}
      </div>

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

      {errors.submit && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">{errors.submit}</p>
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
  )
}
