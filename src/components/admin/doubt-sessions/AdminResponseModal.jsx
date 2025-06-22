"use client"

import { useState, useEffect } from "react"
import {
  X,
  Calendar,
  Clock,
  Video,
  Phone,
  User,
  Mail,
  LinkIcon,
  Save,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { formatDate } from "@/utils/formatting/dateUtils"

export default function AdminResponseModal({ isOpen, onClose, session, onSuccess }) {
  const [formData, setFormData] = useState({
    mentorName: "",
    mentorEmail: "",
    scheduledDate: "",
    scheduledTime: "",
    meetingPlatform: "Zoom",
    meetingLink: "",
    sessionDuration: "60",
    responseDescription: "",
    specialInstructions: "",
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(false)
  const [showMentorDropdown, setShowMentorDropdown] = useState(false)
  const [errors, setErrors] = useState({})
  const [showValidation, setShowValidation] = useState(false)

  // Fetch available mentors
  useEffect(() => {
    if (isOpen) {
      fetchMentors()
      // Reset errors when modal opens
      setErrors({})
      setShowValidation(false)
    }
  }, [isOpen])

  const fetchMentors = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/mentors", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMentors(data.mentors || [])
      }
    } catch (error) {
      console.error("Failed to fetch mentors:", error)
    }
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && session) {
      const existingResponse = session.adminResponse || {}
      setFormData({
        mentorName: existingResponse.mentorName || "",
        mentorEmail: existingResponse.mentorEmail || "",
        scheduledDate: existingResponse.scheduledDateTime
          ? existingResponse.scheduledDateTime.split("T")[0]
          : session.preferredTimeSlot.date.split("T")[0],
        scheduledTime: existingResponse.scheduledDateTime
          ? existingResponse.scheduledDateTime.split("T")[1]?.substring(0, 5)
          : session.preferredTimeSlot.time,
        meetingPlatform: existingResponse.meetingPlatform || (session.mode === "WhatsApp" ? "Zoom" : session.mode),
        meetingLink: existingResponse.meetingLink || "",
        sessionDuration: existingResponse.sessionDuration?.toString() || "60",
        responseDescription: existingResponse.responseDescription || "",
        specialInstructions: existingResponse.specialInstructions || "",
      })
    }
  }, [isOpen, session])

  // Validation function
  const validateForm = (asDraft = false) => {
    const newErrors = {}

    if (!asDraft) {
      // Required fields for sending response
      if (!formData.mentorName.trim()) {
        newErrors.mentorName = "Mentor name is required"
      }

      if (!formData.mentorEmail.trim()) {
        newErrors.mentorEmail = "Mentor email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mentorEmail)) {
        newErrors.mentorEmail = "Please enter a valid email address"
      }

      if (!formData.scheduledDate) {
        newErrors.scheduledDate = "Scheduled date is required"
      }

      if (!formData.scheduledTime) {
        newErrors.scheduledTime = "Scheduled time is required"
      }

      if (!formData.meetingLink.trim()) {
        newErrors.meetingLink = "Meeting link is required"
      } else if (!/^https?:\/\/.+/.test(formData.meetingLink)) {
        newErrors.meetingLink = "Please enter a valid URL (starting with http:// or https://)"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes and clear errors
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  // Handle mentor selection
  const handleMentorSelect = (mentor) => {
    handleInputChange("mentorName", mentor.name)
    handleInputChange("mentorEmail", mentor.email)
    setShowMentorDropdown(false)
  }

  // Handle form submission
  const handleSubmit = async (asDraft = false) => {
    setShowValidation(true)

    if (!validateForm(asDraft)) {
      // Show error summary
      const errorCount = Object.keys(errors).length
      toast.error(`Please fix ${errorCount} error${errorCount > 1 ? "s" : ""} before submitting`)
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const responseData = {
        adminResponse: {
          mentorName: formData.mentorName,
          mentorEmail: formData.mentorEmail,
          scheduledDateTime: `${formData.scheduledDate}T${formData.scheduledTime}`,
          meetingPlatform: formData.meetingPlatform,
          meetingLink: formData.meetingLink,
          sessionDuration: Number.parseInt(formData.sessionDuration),
          responseDescription: formData.responseDescription,
          specialInstructions: formData.specialInstructions,
          respondedAt: new Date(),
          isDraft: asDraft,
        },
        status: asDraft ? "pending" : "confirmed",
      }

      const response = await fetch(`/api/admin/doubt-sessions/${session._id}/respond`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responseData),
      })

      if (response.ok) {
        if (!asDraft) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          toast.success("Response sent successfully! Student has been notified.")
        } else {
          toast.success("Draft saved successfully!")
        }
        onSuccess()
      } else {
        const errorData = await response.json()
        toast.error(`Failed to submit response: ${errorData.error}`)
      }
    } catch (error) {
      toast.error(`Failed to submit response: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !session) return null

  const filteredMentors = mentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(formData.mentorName.toLowerCase()),
  )

  // Check if form has required fields filled
  const hasRequiredFields =
    formData.mentorName &&
    formData.mentorEmail &&
    formData.scheduledDate &&
    formData.scheduledTime &&
    formData.meetingLink
  const errorCount = Object.keys(errors).length

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-5xl h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-white">Respond to Doubt Session</h2>
              <p className="text-slate-400 mt-1">Configure session details and send response to student</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Validation Summary */}
          {/* {showValidation && errorCount > 0 && (
            <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-red-300 font-medium mb-2">Please fix the following errors:</h4>
                <ul className="text-sm text-red-400 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )} */}

          {/* Student Summary - Fixed */}
          <div className="p-6 bg-slate-700/50 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {session.studentName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{session.studentName}</h3>
                  <Badge variant="outline">Class {session.studentClass}</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{session.subject}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="h-4 w-4 text-green-400" />
                    <span>{session.whatsappNo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-4 w-4 text-teal-400" />
                    <span>{formatDate(session.preferredTimeSlot.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-4 w-4 text-teal-400" />
                    <span>{session.preferredTimeSlot.time}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-white mb-1">Topic: {session.topic}</p>
                  <p className="text-sm text-slate-400">{session.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mentor Selection */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-teal-400" />
                    Mentor Assignment
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Mentor Name *
                      {formData.mentorName && !errors.mentorName && (
                        <CheckCircle className="inline h-4 w-4 text-green-400 ml-2" />
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        value={formData.mentorName}
                        onChange={(e) => {
                          handleInputChange("mentorName", e.target.value)
                          setShowMentorDropdown(e.target.value.length > 0)
                        }}
                        onFocus={() => setShowMentorDropdown(formData.mentorName.length > 0)}
                        placeholder="Select or type mentor name"
                        className={`w-full ${errors.mentorName ? "border-red-500 focus:ring-red-500" : ""}`}
                      />
                      {errors.mentorName && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.mentorName}
                        </p>
                      )}
                      {showMentorDropdown && filteredMentors.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-slate-700 border border-slate-600 rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                          {filteredMentors.map((mentor) => (
                            <button
                              key={mentor._id}
                              onClick={() => handleMentorSelect(mentor)}
                              className="w-full px-4 py-2 text-left hover:bg-slate-600 text-white"
                            >
                              <div className="font-medium">{mentor.name}</div>
                              <div className="text-sm text-slate-400">{mentor.email}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Mentor Email *
                      {formData.mentorEmail && !errors.mentorEmail && (
                        <CheckCircle className="inline h-4 w-4 text-green-400 ml-2" />
                      )}
                    </label>
                    <Input
                      type="email"
                      value={formData.mentorEmail}
                      onChange={(e) => handleInputChange("mentorEmail", e.target.value)}
                      placeholder="mentor@example.com"
                      icon={<Mail className="h-4 w-4" />}
                      className={errors.mentorEmail ? "border-red-500 focus:ring-red-500" : ""}
                    />
                    {errors.mentorEmail && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.mentorEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Session Scheduling */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-teal-400" />
                    Session Scheduling
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Scheduled Date *
                        {formData.scheduledDate && !errors.scheduledDate && (
                          <CheckCircle className="inline h-4 w-4 text-green-400 ml-2" />
                        )}
                      </label>
                      <Input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                        className={errors.scheduledDate ? "border-red-500 focus:ring-red-500" : ""}
                      />
                      {errors.scheduledDate && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.scheduledDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Scheduled Time *
                        {formData.scheduledTime && !errors.scheduledTime && (
                          <CheckCircle className="inline h-4 w-4 text-green-400 ml-2" />
                        )}
                      </label>
                      <Input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                        className={errors.scheduledTime ? "border-red-500 focus:ring-red-500" : ""}
                      />
                      {errors.scheduledTime && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.scheduledTime}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Session Duration</label>
                    <select
                      value={formData.sessionDuration}
                      onChange={(e) => handleInputChange("sessionDuration", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                </div>

                {/* Meeting Platform */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Video className="h-5 w-5 text-teal-400" />
                    Meeting Platform
                  </h4>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleInputChange("meetingPlatform", "Zoom")}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        formData.meetingPlatform === "Zoom"
                          ? "border-teal-500 bg-teal-500/10 text-teal-400"
                          : "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <Video className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Zoom</div>
                    </button>
                    <button
                      onClick={() => handleInputChange("meetingPlatform", "Google Meet")}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        formData.meetingPlatform === "Google Meet"
                          ? "border-teal-500 bg-teal-500/10 text-teal-400"
                          : "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <Video className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Google Meet</div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Meeting Link *
                      {formData.meetingLink && !errors.meetingLink && (
                        <CheckCircle className="inline h-4 w-4 text-green-400 ml-2" />
                      )}
                    </label>
                    <Input
                      value={formData.meetingLink}
                      onChange={(e) => handleInputChange("meetingLink", e.target.value)}
                      placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                      icon={<LinkIcon className="h-4 w-4" />}
                      className={errors.meetingLink ? "border-red-500 focus:ring-red-500" : ""}
                    />
                    {errors.meetingLink && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.meetingLink}
                      </p>
                    )}
                  </div>
                </div>

                {/* Response Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Response Details</h4>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Response Description</label>
                    <textarea
                      value={formData.responseDescription}
                      onChange={(e) => handleInputChange("responseDescription", e.target.value)}
                      placeholder="Provide details about the session, what will be covered, preparation needed, etc."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={formData.specialInstructions}
                      onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                      placeholder="Any special instructions for the student (materials to bring, prerequisites, etc.)"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-700/30 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-400">* Required fields must be filled to send response</div>
              {hasRequiredFields && (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  All required fields completed
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              {/* <Button variant="ghost" onClick={() => handleSubmit(true)} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button> */}
              <Button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className={`${hasRequiredFields ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-600 cursor-not-allowed"}`}
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Response & Confirm"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Sparkles className="h-16 w-16 text-teal-400 animate-bounce" />
          </div>
        </div>
      )}
    </>
  )
}
