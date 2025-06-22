"use client"

import { useState } from "react"
import {
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Video,
  MessageCircle,
  Edit,
  Check,
  Send,
  CheckCheck,
} from "lucide-react"
import Button from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/utils/formatting/dateUtils"

export default function SessionCard({ session, onRespond, onStatusUpdate, viewMode = "grid" }) {
  const [updating, setUpdating] = useState(false)

  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toLowerCase().trim()

    switch (normalizedStatus) {
      case "pending":
        return {
          color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          label: "Pending",
          description: "Waiting for admin response",
        }
      case "responded":
        return {
          color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          label: "Responded",
          description: "Response sent to student",
        }
      case "received":
      case "recieved":
        return {
          color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          label: "Received",
          description: "Student has read the response",
        }
      case "completed":
        return {
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          label: "Completed",
          description: "Session completed successfully",
        }
      case "cancelled":
        return {
          color: "bg-red-500/10 text-red-400 border-red-500/20",
          label: "Cancelled",
          description: "Session was cancelled",
        }
      case "confirmed":
        return {
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          label: "Confirmed",
          description: "Session confirmed by admin",
        }
      default:
        return {
          color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
          label: `Unknown (${status})`,
          description: "Unknown status - needs debugging",
        }
    }
  }

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase().trim()

    switch (normalizedStatus) {
      case "pending":
        return <AlertCircle className="h-3 w-3" />
      case "responded":
        return <Send className="h-3 w-3" />
      case "received":
      case "recieved":
        return <CheckCheck className="h-3 w-3" />
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      case "cancelled":
        return <XCircle className="h-3 w-3" />
      case "confirmed":
        return <CheckCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const getSubjectConfig = (subject) => {
    const configs = {
      Chemistry: "bg-green-500/10 text-green-400 border-green-500/20",
      Physics: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Mathematics: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Biology: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    }
    return configs[subject] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
  }

  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case "zoom":
        return <Video className="h-4 w-4 text-blue-400" />
      case "whatsapp":
        return <MessageCircle className="h-4 w-4 text-green-400" />
      case "google meet":
        return <Video className="h-4 w-4 text-red-400" />
      case "phone call":
        return <Phone className="h-4 w-4 text-purple-400" />
      default:
        return <User className="h-4 w-4 text-slate-400" />
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      // Get token from localStorage or cookies
      const token =
        localStorage.getItem("token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]

      if (!token) {
        alert("Authentication required. Please login again.")
        return
      }

      // Call the API to update status in backend
      const response = await fetch(`/api/admin/doubt-sessions/${session._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          action: "complete",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Session completed successfully:", result)
        // Call the parent's onStatusUpdate to refresh the UI
        await onStatusUpdate(session._id, newStatus)
      } else {
        const error = await response.json()
        console.error("❌ Failed to complete session:", error)
        alert(error.message || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  const getActionButtons = () => {
    const normalizedStatus = session.status?.toLowerCase().trim()

    switch (normalizedStatus) {
      case "pending":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRespond(session)}
            className="text-slate-300 border-slate-600 hover:bg-slate-700/30 hover:border-slate-500 hover:text-white transition-all duration-200"
          >
            {/* <Eye className="h-4 w-4 mr-2" /> */}
            Respond
          </Button>
        )

      case "responded":
        return (
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRespond(session)}
              className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Response
            </Button>
            {/* <div className="text-xs text-slate-400 px-2 py-1 bg-slate-800/30 rounded border border-slate-600/30">
              Waiting for student to read
            </div> */}
          </div>
        )

      case "received":
      case "recieved":
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRespond(session)}
              className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Response
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate("completed")}
              disabled={updating}
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400 transition-all duration-200 disabled:opacity-50"
            >
              <Check className="h-4 w-4 mr-2" />
              {updating ? "Completing..." : "Mark Completed"}
            </Button>
          </div>
        )

      case "completed":
        return (
          <div className="flex items-center gap-2 text-emerald-400 opacity-70">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Session Completed</span>
            {session.completedAt && (
              <span className="text-xs text-slate-400">on {new Date(session.completedAt).toLocaleDateString()}</span>
            )}
          </div>
        )

      case "cancelled":
        return (
          <div className="flex items-center gap-2 text-red-400 opacity-70">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Session Cancelled</span>
          </div>
        )

      case "confirmed":
        return (
          <div className="flex items-center gap-2 text-emerald-400 opacity-70">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Session Confirmed</span>
            {session.adminResponse && (
              <div className="text-xs text-slate-400 ml-2">Mentor: {session.adminResponse.mentorName}</div>
            )}
          </div>
        )

      default:
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-400 text-xs bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>Status: {session.status || "Unknown"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRespond(session)}
              className="text-teal-400 border-teal-500/30 hover:bg-teal-500/10"
            >
              Debug/Respond
            </Button>
          </div>
        )
    }
  }

  const statusConfig = getStatusConfig(session.status)
  const subjectConfig = getSubjectConfig(session.subject)

  // Simple fade for completed sessions - no blur
  const isCompleted = session.status?.toLowerCase() === "completed"
  const cardOpacity = isCompleted ? "opacity-60" : "opacity-100"

  if (viewMode === "list") {
    return (
      <div className={`transition-all duration-300 ${cardOpacity}`}>
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                  {session.studentName.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${
                    session.status === "pending"
                      ? "bg-amber-500"
                      : session.status === "responded"
                        ? "bg-blue-500"
                        : session.status === "received" || session.status === "recieved"
                          ? "bg-purple-500"
                          : session.status === "completed"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                  }`}
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-white">{session.studentName}</h3>
                  <Badge variant="outline" className="text-xs bg-slate-700/50 border-slate-600/50 text-slate-300">
                    Class {session.studentClass}
                  </Badge>
                  <Badge className={`text-xs ${subjectConfig}`}>{session.subject}</Badge>
                  <Badge className={`text-xs ${statusConfig.color} flex items-center gap-1`}>
                    {getStatusIcon(session.status)}
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{session.topic}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="h-4 w-4 text-emerald-400" />
                    <span>{session.whatsappNo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span>{formatDate(session.preferredTimeSlot.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span>{session.preferredTimeSlot.time}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">{getActionButtons()}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`transition-all duration-300 ${cardOpacity}`}>
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                {session.studentName.charAt(0).toUpperCase()}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${
                  session.status === "pending"
                    ? "bg-amber-500"
                    : session.status === "responded"
                      ? "bg-blue-500"
                      : session.status === "received" || session.status === "recieved"
                        ? "bg-purple-500"
                        : session.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                }`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{session.studentName}</h3>
              <p className="text-sm text-slate-400">Class {session.studentClass}</p>
            </div>
          </div>
          <Badge className={`text-xs ${statusConfig.color} flex items-center gap-1`}>
            {getStatusIcon(session.status)}
            {statusConfig.label}
          </Badge>
        </div>

        {/* Subject and Topic */}
        <div className="mb-4 space-y-3">
          <Badge className={`text-sm ${subjectConfig}`}>{session.subject}</Badge>
          <div>
            <h4 className="text-white font-medium text-base mb-1">{session.topic}</h4>
            {/* <p className="text-sm text-slate-300 line-clamp-2">{session.description}</p> */}
          </div>
        </div>

        {/* Session Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Phone className="h-4 w-4 text-emerald-400" />
            </div>
            <span>{session.whatsappNo}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Calendar className="h-4 w-4 text-blue-400" />
            </div>
            <span>{formatDate(session.preferredTimeSlot.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
            <span>{session.preferredTimeSlot.time}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
              {getModeIcon(session.mode)}
            </div>
            <span className="capitalize">{session.mode}</span>
          </div>
        </div>

        {/* Admin Response Status */}
        {/* {session.adminResponse && session.adminResponse.responseDescription && (
          <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  session.status === "responded"
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : session.status === "received" || session.status === "recieved"
                      ? "bg-purple-500/20 border border-purple-500/30"
                      : "bg-emerald-500/20 border border-emerald-500/30"
                }`}
              >
                {session.status === "responded" ? (
                  <Send className="h-3 w-3 text-blue-400" />
                ) : session.status === "received" || session.status === "recieved" ? (
                  <CheckCheck className="h-3 w-3 text-purple-400" />
                ) : (
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  session.status === "responded"
                    ? "text-blue-400"
                    : session.status === "received" || session.status === "recieved"
                      ? "text-purple-400"
                      : "text-emerald-400"
                }`}
              >
                {session.status === "responded"
                  ? "Response Sent"
                  : session.status === "received" || session.status === "recieved"
                    ? "Response Read by Student"
                    : "Session Completed"}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              <span className="font-medium">Mentor:</span> {session.adminResponse.mentorName} •{" "}
              <span className="font-medium">Platform:</span> {session.adminResponse.meetingPlatform}
              {session.adminResponse.scheduledDateTime && (
                <>
                  {" "}
                  • <span className="font-medium">Scheduled:</span>{" "}
                  {new Date(session.adminResponse.scheduledDateTime).toLocaleString()}
                </>
              )}
            </p>
          </div>
        )} */}

        {/* Actions */}
        <div className="flex items-center justify-center">{getActionButtons()}</div>
      </div>
    </div>
  )
}
