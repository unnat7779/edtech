"use client"

import { useState } from "react"
import {
  Clock,
  CheckCircle,
  Inbox,
  CheckSquare,
  Calendar,
  Video,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { toast } from "react-hot-toast"

// Status configuration
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    icon: Clock,
    pulseClass: "animate-pulse",
  },
  responded: {
    label: "Responded",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    icon: CheckCircle,
    pulseClass: "animate-pulse",
  },
  received: {
    label: "Received",
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
    icon: Inbox,
    pulseClass: "",
  },
  completed: {
    label: "Completed",
    bgColor: "bg-gray-500/20",
    textColor: "text-gray-400",
    borderColor: "border-gray-500/30",
    icon: CheckSquare,
    pulseClass: "",
  },
}

// Subject colors
const SUBJECT_COLORS = {
  Physics: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Chemistry: "bg-green-500/20 text-green-400 border-green-500/30",
  Mathematics: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Math: "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

// Expandable text component
const ExpandableText = ({ text, maxLength = 100 }) => {
  const [expanded, setExpanded] = useState(false)

  if (!text || text.length <= maxLength) {
    return <span className="text-slate-300">{text}</span>
  }

  return (
    <div className="space-y-2">
      <p className="text-slate-300 leading-relaxed">{expanded ? text : `${text.slice(0, maxLength)}...`}</p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3 h-3" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            Show more
          </>
        )}
      </button>
    </div>
  )
}

export default function StudentSessionCard({ session, onMarkRead, isFirstView = false }) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isMarking, setIsMarking] = useState(false)

  const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  const subjectColorClass = SUBJECT_COLORS[session.subject] || "bg-slate-500/20 text-slate-400 border-slate-500/30"

  const handleMarkAsRead = async () => {
    if (isMarking) return

    setIsMarking(true)
    try {
      await onMarkRead(session._id)
      setIsConfirmed(true)
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

  const isCompleted = session.status === "completed"

  return (
    <div
      className={`group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
        isCompleted ? "opacity-60 hover:opacity-70" : "hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/10"
      } border-slate-700/50 hover:border-teal-500/30 h-[420px] flex flex-col`}
    >
      {/* First view indicator */}
      {isFirstView && session.status === "responded" && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
      )}

      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-white truncate">
                {formatDate(session.preferredTimeSlot?.date || session.createdAt)}
              </h3>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} ${statusConfig.pulseClass} ${
                  isCompleted ? "opacity-80" : ""
                }`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </div>
            </div>

            {/* Subject and Topic */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`px-3 py-1 rounded-lg text-sm font-medium border ${subjectColorClass} ${
                  isCompleted ? "opacity-70" : ""
                }`}
              >
                {session.subject}
              </div>
              <span className="text-slate-400 text-sm">•</span>
              <span className="text-slate-300 text-sm font-medium">{session.topic}</span>
            </div>
          </div>

          {/* Confirmation badge */}
          {isConfirmed && (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30 animate-scale-in">
              <Sparkles className="w-3 h-3" />
              Confirmed!
            </div>
          )}
        </div>

        {/* Core Content */}
        <div className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Description</h4>
            <ExpandableText text={session.description} maxLength={120} />
          </div>

          {/* Time and Mode */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">{formatTime(session.preferredTimeSlot?.time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">{session.mode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Response Section */}
      {session.adminResponse && (
        <div className="px-6 pb-4">
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-600/30">
            <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Admin Response
            </h4>

            <div className="space-y-3">
              {/* Mentor Details */}
              {session.adminResponse.mentorName && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{session.adminResponse.mentorName}</p>
                    {session.adminResponse.mentorEmail && (
                      <a
                        href={`mailto:${session.adminResponse.mentorEmail}`}
                        className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {session.adminResponse.mentorEmail}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Meeting Details */}
              {session.adminResponse.scheduledDateTime && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {new Date(session.adminResponse.scheduledDateTime).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Response Description */}
              {session.adminResponse.responseDescription && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Response:</p>
                  <ExpandableText text={session.adminResponse.responseDescription} maxLength={150} />
                </div>
              )}

              {/* Special Instructions */}
              {session.adminResponse.specialInstructions && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-xs text-amber-400 mb-1 font-medium">Special Instructions:</p>
                  <ExpandableText text={session.adminResponse.specialInstructions} maxLength={100} />
                </div>
              )}

              {/* Meeting Link */}
              {session.adminResponse?.meetingLink &&
                (isCompleted ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 text-slate-500 rounded-xl font-medium cursor-not-allowed border border-slate-600/30">
                    <Video className="w-4 h-4" />
                    Meeting Expired
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </div>
                ) : (
                  <a
                    href={session.adminResponse.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  >
                    <Video className="w-4 h-4" />
                    Join Meeting
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Section */}
      {session.status === "responded" && !isConfirmed && (
        <div className="px-6 pb-6">
          <button
            onClick={handleMarkAsRead}
            disabled={isMarking}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
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
        </div>
      )}
    </div>
  )
}
