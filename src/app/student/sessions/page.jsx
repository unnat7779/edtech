"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  CheckCircle,
  Inbox,
  CheckSquare,
  Search,
  Video,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  AlertTriangle,
  Star,
  Heart,
  User,
  MessageSquare,
  Calendar,
  Mail,
} from "lucide-react"
import { getStoredUser, getStoredToken } from "@/lib/auth-utils"
import { toast } from "react-hot-toast"

// Status configuration with colors and icons
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "amber",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    icon: Clock,
    pulseClass: "animate-pulse",
  },
  responded: {
    label: "Responded",
    color: "blue",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    icon: CheckCircle,
    pulseClass: "animate-pulse",
  },
  received: {
    label: "Received",
    color: "green",
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
    icon: Inbox,
    pulseClass: "",
  },
  completed: {
    label: "Completed",
    color: "gray",
    bgColor: "bg-gray-500/20",
    textColor: "text-gray-400",
    borderColor: "border-gray-500/30",
    icon: CheckSquare,
    pulseClass: "",
  },
}

// Subject color coding
const SUBJECT_COLORS = {
  Physics: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Chemistry: "bg-green-500/20 text-green-400 border-green-500/30",
  Mathematics: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Math: "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

// Lightweight celebration animation
const CelebrationAnimation = ({ show }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Smooth floating particles */}
      <div className="relative">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${Math.cos((i * Math.PI * 2) / 8) * 60}px`,
              top: `${Math.sin((i * Math.PI * 2) / 8) * 60}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: "1s",
            }}
          >
            {i % 2 === 0 ? <Star className="w-4 h-4 text-yellow-400" /> : <Heart className="w-4 h-4 text-pink-400" />}
          </div>
        ))}

        {/* Central success icon */}
        <div className="animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
      </div>
    </div>
  )
}

// Success message modal
const SuccessModal = ({ show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000) // Auto close after 4 seconds
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-green-900/90 to-emerald-900/90 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8 max-w-md w-full text-center animate-scale-in">
        <div className="mb-4">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto animate-bounce" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-3">Session Confirmed! 🎉</h3>

        <div className="space-y-2 text-green-100 mb-6">
          <p className="text-lg">Kindly join the session on time.</p>
          <p className="text-xl font-semibold text-green-300">Good luck! ✨</p>
        </div>

        <button
          onClick={onClose}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

// Admin Response Modal
const AdminResponseModal = ({ isOpen, onClose, session }) => {
  if (!isOpen || !session?.adminResponse) return null

  const isCompleted = session.status === "completed"

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-xl font-bold text-white">Admin Response</h3>
            <p className="text-slate-400 text-sm mt-1">Session details and instructions</p>
            {isCompleted && (
              <div className="flex items-center gap-2 mt-2 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Session completed - Meeting links may be expired
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mentor Information */}
          {session.adminResponse.mentorName && (
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/30">
              <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assigned Mentor
              </h4>
              <div className="space-y-2">
                <p className="text-white font-medium">{session.adminResponse.mentorName}</p>
                {session.adminResponse.mentorEmail && (
                  <a
                    href={`mailto:${session.adminResponse.mentorEmail}`}
                    className="text-teal-400 hover:text-teal-300 flex items-center gap-2 text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    {session.adminResponse.mentorEmail}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Session Details */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/30">
            <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Session Schedule
            </h4>
            <div className="space-y-3">
              {session.adminResponse.scheduledDateTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{formatDateTime(session.adminResponse.scheduledDateTime)}</span>
                </div>
              )}
              {session.adminResponse.sessionDuration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">Duration: {session.adminResponse.sessionDuration} minutes</span>
                </div>
              )}
              {session.adminResponse.meetingPlatform && (
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">Platform: {session.adminResponse.meetingPlatform}</span>
                </div>
              )}
            </div>
          </div>

          {/* Response Description */}
          {session.adminResponse.responseDescription && (
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/30">
              <h4 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Response Details
              </h4>
              <p className="text-slate-300 leading-relaxed">{session.adminResponse.responseDescription}</p>
            </div>
          )}

          {/* Special Instructions */}
          {session.adminResponse.specialInstructions && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-amber-400 mb-3">⚠️ Special Instructions</h4>
              <p className="text-amber-100 leading-relaxed">{session.adminResponse.specialInstructions}</p>
            </div>
          )}

          {/* Meeting Link */}
          {session.adminResponse.meetingLink && (
            <div className="flex justify-center pt-4">
              {isCompleted ? (
                <div className="w-full text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700/50 text-slate-400 rounded-xl font-medium cursor-not-allowed opacity-60">
                    <Video className="w-5 h-5" />
                    Meeting Link Expired
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <p className="text-slate-500 text-sm mt-2">This session has been completed</p>
                </div>
              ) : (
                <a
                  href={session.adminResponse.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                >
                  <Video className="w-5 h-5" />
                  Join Meeting
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Replace the ExpandableText component with this simpler version
const TruncatedText = ({ text, maxLength = 60 }) => {
  if (!text || text.length <= maxLength) {
    return <span className="text-slate-300">{text}</span>
  }

  return <span className="text-slate-300">{text.slice(0, maxLength)}...</span>
}

// Description Modal Component
const DescriptionModal = ({ isOpen, onClose, session }) => {
  if (!isOpen || !session) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-xl font-bold text-white">Session Details</h3>
            <p className="text-slate-400 text-sm mt-1">
              {session.subject} • {session.topic}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Date</p>
              <p className="text-white font-medium">
                {new Date(session.preferredTimeSlot?.date || session.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Time</p>
              <p className="text-white font-medium">{session.preferredTimeSlot?.time || "Time not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Mode</p>
              <p className="text-white font-medium">{session.mode}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Status</p>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[session.status]?.bgColor} ${STATUS_CONFIG[session.status]?.textColor} ${STATUS_CONFIG[session.status]?.borderColor}`}
              >
                {React.createElement(STATUS_CONFIG[session.status]?.icon, { className: "w-3 h-3" })}
                {STATUS_CONFIG[session.status]?.label}
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">Full Description</h4>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/30">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {session.description || "No description provided"}
              </p>
            </div>
          </div>

          {/* Admin Response Preview */}
          {session.adminResponse && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">Admin Response Available</h4>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-300 text-sm">
                  An admin response is available for this session. Use the "View Admin Response" button to see full
                  details.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Individual session card component - REDESIGNED FOR CONSISTENCY WITH COMPLETED STATE
const SessionCard = ({ session, onMarkRead, isFirstView }) => {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showAdminResponseModal, setShowAdminResponseModal] = useState(false)
  const [isMarking, setIsMarking] = useState(false)
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)

  const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  const subjectColorClass = SUBJECT_COLORS[session.subject] || "bg-slate-500/20 text-slate-400 border-slate-500/30"

  // Check if session is completed
  const isCompleted = session.status === "completed"

  const handleMarkAsRead = async () => {
    if (isMarking) return

    setIsMarking(true)
    try {
      await onMarkRead(session._id)
      setIsConfirmed(true)

      // Show celebration animation
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)

      // Show success modal
      setShowSuccessModal(true)

      toast.success("Session confirmed! 🎉")
    } catch (error) {
      toast.error("Failed to mark as read")
    } finally {
      setIsMarking(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return "Time not specified"
    return timeString
  }

  const hasAdminResponse =
    session.adminResponse &&
    (session.adminResponse.mentorName || session.adminResponse.responseDescription || session.adminResponse.meetingLink)

  const showAdminResponseButton = ["responded", "received", "completed"].includes(session.status)

  return (
    <>
      <CelebrationAnimation show={showCelebration} />
      <SuccessModal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      <AdminResponseModal
        isOpen={showAdminResponseModal}
        onClose={() => setShowAdminResponseModal(false)}
        session={session}
      />

      {/* FIXED HEIGHT CARD WITH CONSISTENT LAYOUT - FADED FOR COMPLETED */}
      <div
        className={`group relative backdrop-blur-xl rounded-2xl border transition-all duration-300 h-[420px] flex flex-col ${
          isCompleted
            ? // Completed session styling - faded and less interactive
              "bg-slate-800/30 border-slate-700/30 opacity-70 hover:opacity-80 hover:border-slate-600/40"
            : // Active session styling
              "bg-slate-800/60 border-slate-700/50 hover:border-teal-500/30 hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/10"
        }`}
      >
        {/* First view indicator */}
        {isFirstView && session.status === "responded" && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        )}

        {/* HEADER SECTION - Fixed Height */}
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h3 className={`text-lg font-bold truncate ${isCompleted ? "text-slate-400" : "text-white"}`}>
                  {formatDate(session.preferredTimeSlot?.date || session.createdAt)}
                </h3>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} ${statusConfig.pulseClass}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>
              </div>

              {/* Subject and Topic */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                    isCompleted ? "bg-slate-600/20 text-slate-500 border-slate-600/30" : subjectColorClass
                  }`}
                >
                  {session.subject}
                </div>
                <span className={`text-sm ${isCompleted ? "text-slate-500" : "text-slate-400"}`}>•</span>
                <span className={`text-sm font-medium truncate ${isCompleted ? "text-slate-500" : "text-slate-300"}`}>
                  {session.topic}
                </span>
              </div>
            </div>

            {/* Confirmation badge */}
            {isConfirmed && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30 animate-scale-in flex-shrink-0">
                <Sparkles className="w-3 h-3" />
                Confirmed!
              </div>
            )}
          </div>
        </div>

        {/* CONTENT SECTION - Flexible Height */}
        <div className="px-6 flex-1 flex flex-col">
          {/* Description */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-sm font-medium ${isCompleted ? "text-slate-500" : "text-slate-400"}`}>
                Description
              </h4>
              {session.description && session.description.length > 60 && (
                <button
                  onClick={() => setShowDescriptionModal(true)}
                  className={`text-xs px-2 py-1 rounded-md transition-colors ${
                    isCompleted
                      ? "text-slate-500 hover:text-slate-400 hover:bg-slate-700/30"
                      : "text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
                  }`}
                >
                  View Details
                </button>
              )}
            </div>
            <div className="min-h-[3rem] flex items-start">
              <TruncatedText text={session.description} maxLength={60} />
            </div>
          </div>

          {/* Time and Mode */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isCompleted ? "text-slate-500" : "text-slate-400"}`} />
              <span className={`text-sm ${isCompleted ? "text-slate-500" : "text-slate-300"}`}>
                {formatTime(session.preferredTimeSlot?.time)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Video className={`w-4 h-4 ${isCompleted ? "text-slate-500" : "text-slate-400"}`} />
              <span className={`text-sm ${isCompleted ? "text-slate-500" : "text-slate-300"}`}>{session.mode}</span>
            </div>
          </div>

          {/* Spacer to push actions to bottom */}
          <div className="flex-1"></div>
        </div>

        {/* ACTION SECTION - Fixed Height at Bottom */}
        <div className="p-6 pt-4 flex-shrink-0 border-t border-slate-700/30">
          <div className="space-y-3">
            {/* Admin Response Button - Always show for responded/received/completed */}
            {showAdminResponseButton && (
              <button
                onClick={() => setShowAdminResponseModal(true)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  isCompleted
                    ? // Completed session button styling
                      hasAdminResponse
                      ? "bg-slate-600/20 text-slate-500 border border-slate-600/30 hover:bg-slate-600/30"
                      : "bg-slate-700/30 text-slate-500 border border-slate-600/30 hover:bg-slate-700/50"
                    : // Active session button styling
                      hasAdminResponse
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 hover:scale-105"
                      : "bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700/70 hover:scale-105"
                }`}
              >
                <Eye className="w-4 h-4" />
                {hasAdminResponse ? "View Admin Response" : "No Admin Response Yet"}
              </button>
            )}

            {/* Mark as Read Button - Only for responded status */}
            {session.status === "responded" && !isConfirmed && (
              <button
                onClick={handleMarkAsRead}
                disabled={isMarking}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFirstView ? "animate-pulse shadow-lg shadow-blue-500/25" : ""
                }`}
              >
                {isMarking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Marking as Read...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Mark as Read
                  </>
                )}
              </button>
            )}

            {/* Quick Join Meeting Button - If meeting link exists */}
            {hasAdminResponse && session.adminResponse.meetingLink && (
              <>
                {isCompleted ? (
                  // Disabled button for completed sessions
                  <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/30 text-slate-500 rounded-xl font-medium cursor-not-allowed opacity-60">
                    <Video className="w-4 h-4" />
                    Meeting Expired
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                ) : (
                  // Active button for non-completed sessions
                  <a
                    href={session.adminResponse.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  >
                    <Video className="w-4 h-4" />
                    Join Meeting
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <DescriptionModal
        isOpen={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        session={session}
      />
    </>
  )
}

// Main component - keeping the rest unchanged
export default function StudentSessionsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [filteredSessions, setFilteredSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [firstViewSessions, setFirstViewSessions] = useState(new Set())

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        // Use the auth utility functions to get stored data
        const token = getStoredToken()
        const userData = getStoredUser()

        console.log("🔍 Auth check - Token exists:", !!token)
        console.log("🔍 Auth check - User data:", userData)
        console.log("🔍 Auth check - User role:", userData?.role)

        if (!token) {
          console.error("❌ No token found, redirecting to login")
          router.push("/login")
          return
        }

        if (!userData) {
          console.error("❌ No user data found, redirecting to login")
          router.push("/login")
          return
        }

        // Allow both admin and student users to access sessions
        if (userData.role && userData.role !== "student" && userData.role !== "admin") {
          console.error("❌ User is not authorized, role:", userData.role)
          router.push("/login")
          return
        }

        // Verify token is still valid by making a test API call
        console.log("🔍 Verifying token validity...")
        const testResponse = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("📡 Sessions API response status:", testResponse.status)

        if (!testResponse.ok) {
          if (testResponse.status === 401 || testResponse.status === 403) {
            console.error("❌ Authentication failed in fetchSessions, clearing auth data")
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.push("/login")
            return
          }
          throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`)
        }

        const validatedUser = await testResponse.json()
        console.log("✅ Token validated, user:", validatedUser.user?.name)

        // Update user data with validated information
        setUser(validatedUser.user || userData)
        fetchSessions()
      } catch (error) {
        console.error("❌ Auth check error:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
      }
    }

    checkAuthAndFetchData()
  }, [router])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError("")

      const token = getStoredToken()
      if (!token) {
        console.error("❌ No token found in fetchSessions")
        router.push("/login")
        return
      }

      console.log("📡 Fetching sessions with token...")
      const response = await fetch("/api/doubt-sessions", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Sessions API response status:", response.status)

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.push("/login")
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch sessions")
      }

      const data = await response.json()
      console.log("✅ Sessions data received:", data)

      if (data.success) {
        const sessionsList = data.sessions || []
        setSessions(sessionsList)
        setFilteredSessions(sessionsList)

        // Track first-view sessions (responded status that haven't been read)
        const firstViewSet = new Set()
        sessionsList.forEach((session) => {
          if (session.status === "responded" && !session.readAt) {
            firstViewSet.add(session._id)
          }
        })
        setFirstViewSessions(firstViewSet)

        console.log(`✅ Loaded ${sessionsList.length} sessions successfully`)
      } else {
        setError(data.error || "Failed to fetch sessions")
      }
    } catch (error) {
      console.error("❌ Error fetching sessions:", error)

      // Check if it's a network error vs auth error
      if (error.message.includes("401") || error.message.includes("403")) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
      } else {
        setError("Network error: " + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (sessionId) => {
    try {
      const token = getStoredToken()
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/doubt-sessions/${sessionId}/mark-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.push("/login")
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to mark as read")
      }

      const data = await response.json()
      if (data.success) {
        // Update the session in the list
        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session._id === sessionId ? { ...session, status: "received", readAt: new Date() } : session,
          ),
        )

        // Update filtered sessions
        setFilteredSessions((prevSessions) =>
          prevSessions.map((session) =>
            session._id === sessionId ? { ...session, status: "received", readAt: new Date() } : session,
          ),
        )

        // Remove from first view set
        setFirstViewSessions((prev) => {
          const newSet = new Set(prev)
          newSet.delete(sessionId)
          return newSet
        })
      } else {
        throw new Error(data.error || "Failed to mark as read")
      }
    } catch (error) {
      console.error("Error marking as read:", error)
      throw error
    }
  }

  // Filter sessions based on search and filters
  useEffect(() => {
    let filtered = sessions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((session) => session.status === statusFilter)
    }

    // Subject filter
    if (subjectFilter !== "all") {
      filtered = filtered.filter((session) => session.subject === subjectFilter)
    }

    setFilteredSessions(filtered)
  }, [sessions, searchTerm, statusFilter, subjectFilter])

  // Get unique subjects for filter
  const uniqueSubjects = [...new Set(sessions.map((session) => session.subject).filter(Boolean))]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const userData = getStoredUser()
                  if (userData?._id) {
                    router.push(`/dashboard/${userData._id}`)
                  } else {
                    router.push("/dashboard")
                  }
                }}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Session History</h1>
                <p className="text-slate-400 mt-1">Track your doubt sessions and responses</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/book-session")}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Book New Session
              </button>

              <button
                onClick={fetchSessions}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="responded">Responded</option>
            <option value="received">Received</option>
            <option value="completed">Completed</option>
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 h-[420px] animate-pulse"
              >
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-3 bg-slate-700 rounded"></div>
                  <div className="h-3 bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="font-semibold text-red-300">Error Loading Sessions</h3>
                <p className="text-red-400 mt-1">{error}</p>
                <button
                  onClick={fetchSessions}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 inline ${loading ? "animate-spin" : ""}`} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {sessions.length === 0 ? "No Sessions Found" : "No Matching Sessions"}
            </h3>
            <p className="text-slate-400 mb-4">
              {sessions.length === 0
                ? "You haven't submitted any doubt sessions yet."
                : "Try adjusting your search or filter criteria."}
            </p>
            {sessions.length === 0 && (
              <button
                onClick={() => router.push("/book-session")}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Book Your First Session
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                onMarkRead={handleMarkAsRead}
                isFirstView={firstViewSessions.has(session._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
