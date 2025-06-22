"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  BookOpen,
  Calendar,
  Eye,
  Reply,
  MoreHorizontal,
  Mail,
  Phone,
} from "lucide-react"

export default function DoubtSessionTable({ sessions = [], onRespond, onStatusUpdate, loading = false }) {
  const [expandedSession, setExpandedSession] = useState(null)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-400" />
      case "responded":
        return <MessageSquare className="h-4 w-4 text-blue-400" />
      case "received":
        return <AlertCircle className="h-4 w-4 text-purple-400" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      case "responded":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "received":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPreferredTime = (timeSlot) => {
    if (!timeSlot) return "Not specified"
    const { date, time } = timeSlot
    if (!date) return "Not specified"

    try {
      const sessionDate = new Date(date)
      const dateStr = sessionDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
      return `${dateStr}${time ? ` at ${time}` : ""}`
    } catch (error) {
      return "Invalid date"
    }
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case "createdAt":
        aValue = new Date(a.createdAt || 0)
        bValue = new Date(b.createdAt || 0)
        break
      case "status":
        aValue = a.status || ""
        bValue = b.status || ""
        break
      case "subject":
        aValue = a.subject || ""
        bValue = b.subject || ""
        break
      case "studentName":
        aValue = a.studentName || ""
        bValue = b.studentName || ""
        break
      default:
        aValue = a[sortBy] || ""
        bValue = b[sortBy] || ""
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const toggleExpanded = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700/50 rounded-lg w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-700/30 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-12 border border-slate-700/50 shadow-2xl text-center">
        <div className="p-4 bg-slate-700/30 rounded-full w-fit mx-auto mb-4">
          <MessageSquare className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Sessions Found</h3>
        <p className="text-slate-400">No doubt sessions match your current filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Doubt Sessions</h3>
              <p className="text-sm text-slate-400">{sessions.length} sessions found</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-slate-300">
                <button
                  onClick={() => handleSort("studentName")}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <User className="h-4 w-4" />
                  Student
                </button>
              </th>
              <th className="text-left p-4 text-sm font-semibold text-slate-300">
                <button
                  onClick={() => handleSort("subject")}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Subject
                </button>
              </th>
              <th className="text-left p-4 text-sm font-semibold text-slate-300">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Clock className="h-4 w-4" />
                  Status
                </button>
              </th>
              <th className="text-left p-4 text-sm font-semibold text-slate-300">
                <Calendar className="h-4 w-4 inline mr-2" />
                Preferred Time
              </th>
              <th className="text-left p-4 text-sm font-semibold text-slate-300">
                <button
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Created
                </button>
              </th>
              <th className="text-center p-4 text-sm font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSessions.map((session, index) => (
              <>
                <tr
                  key={session._id}
                  className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${
                    index % 2 === 0 ? "bg-slate-800/20" : "bg-slate-800/10"
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {session.studentName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-medium text-white">{session.studentName || "Unknown"}</div>
                        <div className="text-sm text-slate-400 flex items-center gap-2">
                          {session.studentEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {session.studentEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        {session.subject || "General"}
                      </Badge>
                      {session.topic && <div className="text-sm text-slate-300 font-medium">{session.topic}</div>}
                    </div>
                  </td>

                  <td className="p-4">
                    <Badge className={`${getStatusColor(session.status)} text-xs font-medium`}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1 capitalize">{session.status || "pending"}</span>
                    </Badge>
                  </td>

                  <td className="p-4">
                    <div className="text-sm text-slate-300">{formatPreferredTime(session.preferredTimeSlot)}</div>
                  </td>

                  <td className="p-4">
                    <div className="text-sm text-slate-300">{formatDate(session.createdAt)}</div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => toggleExpanded(session._id)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {session.status !== "completed" && (
                        <Button
                          onClick={() => onRespond(session)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                      )}

                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[150px]">
                          {session.status === "responded" && (
                            <button
                              onClick={() => onStatusUpdate(session._id, "completed")}
                              className="w-full text-left px-3 py-2 text-sm text-emerald-300 hover:bg-slate-700 flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark Complete
                            </button>
                          )}
                          {session.status === "pending" && (
                            <button
                              onClick={() => onStatusUpdate(session._id, "received")}
                              className="w-full text-left px-3 py-2 text-sm text-purple-300 hover:bg-slate-700 flex items-center gap-2"
                            >
                              <AlertCircle className="h-4 w-4" />
                              Mark Received
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedSession === session._id && (
                  <tr className="bg-slate-800/40">
                    <td colSpan="6" className="p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Question Details */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-blue-400" />
                              Question Details
                            </h4>
                            <div className="bg-slate-700/30 rounded-lg p-4">
                              <p className="text-slate-300 leading-relaxed">
                                {session.description || "No description provided"}
                              </p>
                            </div>
                            {session.questionImage && (
                              <div className="bg-slate-700/30 rounded-lg p-4">
                                <p className="text-sm text-slate-400 mb-2">Attached Image:</p>
                                <img
                                  src={session.questionImage || "/placeholder.svg"}
                                  alt="Question"
                                  className="max-w-full h-auto rounded-lg border border-slate-600"
                                />
                              </div>
                            )}
                          </div>

                          {/* Session Info */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <User className="h-5 w-5 text-purple-400" />
                              Session Information
                            </h4>
                            <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Priority:</span>
                                <Badge className={`${getPriorityColor(session.priority)} text-xs`}>
                                  {session.priority || "Medium"}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Duration:</span>
                                <span className="text-slate-300">{session.duration || "30 minutes"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Mode:</span>
                                <span className="text-slate-300">{session.mode || "Online"}</span>
                              </div>
                              {session.studentPhone && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Phone:</span>
                                  <span className="text-slate-300 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {session.studentPhone}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Admin Response */}
                        {session.adminResponse && (
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Reply className="h-5 w-5 text-emerald-400" />
                              Admin Response
                            </h4>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                              <p className="text-emerald-100 leading-relaxed">{session.adminResponse}</p>
                              {session.respondedAt && (
                                <p className="text-emerald-300 text-sm mt-2">
                                  Responded on {formatDate(session.respondedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
