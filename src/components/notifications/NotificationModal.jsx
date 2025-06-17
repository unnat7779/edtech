"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  X,
  Bell,
  MessageSquare,
  CheckCircle,
  RefreshCw,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Reply,
  ExternalLink,
  User,
  Calendar,
  FileText,
  Bug,
  HelpCircle,
  ImageIcon,
  Eye,
  Mail,
  GraduationCap,
} from "lucide-react"

export default function NotificationModal({ isOpen, onClose, systemNotifications = [], onRefresh }) {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("notifications")
  const [systemFilter, setSystemFilter] = useState("all")
  const [mounted, setMounted] = useState(false)
  const [localSystemNotifications, setLocalSystemNotifications] = useState(systemNotifications)
  const [markingAsRead, setMarkingAsRead] = useState(new Set())
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setLocalSystemNotifications(systemNotifications)
  }, [systemNotifications])

  useEffect(() => {
    if (isOpen) {
      fetchFeedbacks()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/feedback?limit=20&includeReplies=true", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setFeedbacks(data.feedbacks || [])
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/system-notifications/mark-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAll: true }),
      })

      if (response.ok) {
        setLocalSystemNotifications((prev) =>
          prev
            .map((notification) => {
              if (notification.type === "admin-reply") {
                return null
              } else {
                return { ...notification, isRead: true }
              }
            })
            .filter(Boolean),
        )
        setTimeout(() => {
          onRefresh()
        }, 500)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  const markAsRead = async (notificationId, notificationType) => {
    try {
      setMarkingAsRead((prev) => new Set([...prev, notificationId]))
      const token = localStorage.getItem("token")
      const response = await fetch("/api/system-notifications/mark-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      })

      if (response.ok) {
        setLocalSystemNotifications((prev) =>
          prev
            .map((notification) => {
              if (notification.id === notificationId) {
                if (notificationType === "admin-reply") {
                  return null
                } else {
                  return { ...notification, isRead: true }
                }
              }
              return notification
            })
            .filter(Boolean),
        )

        setTimeout(() => {
          onRefresh()
        }, 1000)
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    } finally {
      setTimeout(() => {
        setMarkingAsRead((prev) => {
          const newSet = new Set(prev)
          newSet.delete(notificationId)
          return newSet
        })
      }, 1000)
    }
  }

  const handleNotificationClick = (notification) => {
    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank")
      if (!notification.isRead) {
        markAsRead(notification.id, notification.type)
      }
    }
  }

  const filteredSystemNotifications = localSystemNotifications.filter((notification) => {
    const matchesFilter = systemFilter === "all" || notification.type === systemFilter
    return matchesFilter
  })

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()
    const messageMatch = feedback.message && feedback.message.toLowerCase().includes(searchLower)
    const typeMatch = feedback.type && feedback.type.toLowerCase().includes(searchLower)
    const subjectMatch = feedback.subject && feedback.subject.toLowerCase().includes(searchLower)
    const descriptionMatch = feedback.description && feedback.description.toLowerCase().includes(searchLower)

    return messageMatch || typeMatch || subjectMatch || descriptionMatch
  })

  const getNotificationIcon = (type) => {
    switch (type) {
      case "admin-reply":
        return <Reply className="h-5 w-5 text-teal-400" />
      case "announcement":
        return <Bell className="h-5 w-5 text-blue-400" />
      case "system":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      default:
        return <Bell className="h-5 w-5 text-slate-400" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "in-progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "resolved":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "closed":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "bug":
        return <Bug className="h-5 w-5 text-red-400" />
      case "test-issue":
        return <FileText className="h-5 w-5 text-blue-400" />
      case "query":
        return <HelpCircle className="h-5 w-5 text-green-400" />
      default:
        return <MessageSquare className="h-5 w-5 text-slate-400" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "bug":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "test-issue":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "query":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    let timeAgo
    if (diffDays > 0) timeAgo = `${diffDays}d ago`
    else if (diffHours > 0) timeAgo = `${diffHours}h ago`
    else if (diffMins > 0) timeAgo = `${diffMins}m ago`
    else timeAgo = "Just now"

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    return {
      date: formattedDate,
      time: formattedTime,
      timeAgo,
      full: `${formattedDate} at ${formattedTime}`,
    }
  }

  const unreadSystemCount = filteredSystemNotifications.filter((n) => !n.isRead).length
  const totalSystemCount = filteredSystemNotifications.length

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2147483647] flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20">
              <Bell className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Notifications</h2>
              <p className="text-sm text-slate-400">
                {unreadSystemCount} unread • {totalSystemCount} total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "notifications" && unreadSystemCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={markingAllAsRead}
                className={`hidden sm:flex transition-all duration-300 ${markingAllAsRead ? "animate-pulse" : ""}`}
              >
                {markingAllAsRead ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-400 border-t-transparent mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {markingAllAsRead ? "Marking..." : "Mark All Read"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onRefresh} className="hidden sm:flex">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center justify-between px-4 sm:px-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "notifications"
                    ? "border-teal-400 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <Bell className="h-4 w-4 mr-2 inline" />
                <span className="hidden sm:inline">System</span> ({unreadSystemCount})
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "feedback"
                    ? "border-teal-400 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2 inline" />
                <span className="hidden sm:inline">Feedback</span> ({feedbacks.length})
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {activeTab === "notifications" && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <select
                    value={systemFilter}
                    onChange={(e) => setSystemFilter(e.target.value)}
                    className="px-2 sm:px-3 py-1 bg-slate-700 border border-slate-600 rounded text-xs sm:text-sm text-slate-200 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All</option>
                    <option value="admin-reply">Admin Replies</option>
                    <option value="announcement">Announcements</option>
                    <option value="system">System</option>
                  </select>
                </div>
              )}

              {activeTab === "feedback" && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-32 sm:w-48"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/50" style={{ maxHeight: "calc(95vh - 200px)" }}>
          {activeTab === "notifications" ? (
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
                  <span className="ml-3 text-slate-400">Loading notifications...</span>
                </div>
              ) : filteredSystemNotifications.length > 0 ? (
                filteredSystemNotifications.map((notification) => {
                  const isMarking = markingAsRead.has(notification.id)
                  const isRead = notification.isRead

                  return (
                    <Card
                      key={notification.id}
                      variant="secondary"
                      className={`transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-teal-500/10 ${
                        isMarking
                          ? "animate-pulse scale-[0.98] opacity-75"
                          : isRead
                            ? "bg-slate-800/40 border-slate-600/50 opacity-70"
                            : "border-teal-500/30 bg-slate-700/80 shadow-lg hover:bg-slate-700/60"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            <div
                              className={`p-2 rounded-lg ${
                                notification.type === "admin-reply"
                                  ? "bg-teal-500/20 border border-teal-500/30"
                                  : notification.type === "announcement"
                                    ? "bg-blue-500/20 border border-blue-500/30"
                                    : "bg-slate-700/50"
                              }`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`font-semibold text-base mb-1 transition-colors ${
                                    isRead ? "text-slate-400" : "text-slate-100"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <p
                                  className={`text-sm leading-relaxed mb-2 transition-colors ${
                                    isRead ? "text-slate-500" : "text-slate-300"
                                  }`}
                                >
                                  {notification.message}
                                </p>
                                {notification.description && (
                                  <div
                                    className={`text-sm p-3 rounded-lg border-l-4 border-teal-500 bg-slate-800/50 mb-3 ${
                                      isRead ? "text-slate-500" : "text-slate-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <Reply className="h-3 w-3 text-teal-400" />
                                      <span className="text-xs font-medium text-teal-400">Admin Response</span>
                                    </div>
                                    <p className="leading-relaxed">{notification.description}</p>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {notification.priority && (
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                                      notification.priority,
                                    )}`}
                                  >
                                    {notification.priority.toUpperCase()}
                                  </span>
                                )}
                                {!isRead && !isMarking && (
                                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                                )}
                                {isMarking && <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />}
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-slate-700/50 gap-2">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="h-3 w-3" />
                                <span>{formatDateTime(notification.createdAt).timeAgo}</span>
                                <span>•</span>
                                <span className="capitalize">{notification.type.replace("-", " ")}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {notification.actionUrl && (
                                  <div className="flex items-center gap-1 text-xs text-teal-400">
                                    <span>View Details</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </div>
                                )}
                                {isRead && (
                                  <div className="flex items-center gap-1 text-xs text-green-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Read</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No notifications found</h3>
                  <p className="text-slate-400">
                    {systemFilter !== "all" ? "Try changing the filter" : "You're all caught up!"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
                  <span className="ml-3 text-slate-400">Loading feedback...</span>
                </div>
              ) : filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback) => {
                  const dateTime = formatDateTime(feedback.createdAt)
                  const adminResponseDateTime = feedback.adminResponse
                    ? formatDateTime(feedback.adminResponse.respondedAt)
                    : null

                  return (
                    <Card
                      key={feedback.id}
                      variant="secondary"
                      className="bg-slate-800/60 border-slate-600/50 hover:bg-slate-700/60 transition-all duration-300 hover:shadow-lg"
                    >
                      <CardContent className="p-4 sm:p-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className={`p-2 sm:p-3 rounded-lg border ${getTypeColor(feedback.type)} flex-shrink-0`}
                            >
                              {getTypeIcon(feedback.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-semibold text-slate-100 text-lg sm:text-xl mb-2 break-words"
                                title={feedback.subject}
                              >
                                {feedback.subject}
                              </h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-400">
                                <div className="flex items-center gap-1">
                                  <span className="capitalize font-medium text-slate-300">
                                    {feedback.type.replace("-", " ")}
                                  </span>
                                  <span>•</span>
                                  <span className="font-mono text-xs">ID: {feedback.feedbackId}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                                feedback.priority,
                              )}`}
                            >
                              {feedback.priority}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(
                                feedback.status,
                              )}`}
                            >
                              <Clock className="h-3 w-3" />
                              {feedback.status}
                            </span>
                          </div>
                        </div>

                        {/* Student Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{feedback.student?.name || "Unknown Student"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Mail className="h-4 w-4" />
                            <span>{feedback.student?.email || "No email"}</span>
                          </div>
                          {feedback.student?.class && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <GraduationCap className="h-4 w-4" />
                              <span>Class {feedback.student.class}</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                              {feedback.description}
                            </p>
                          </div>

                          {/* Images */}
                          {feedback.images && feedback.images.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <ImageIcon className="h-4 w-4" />
                                <span>{feedback.images.length} attachment(s)</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {feedback.images.map((image, index) => (
                                  <div
                                    key={index}
                                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-600 hover:border-teal-500 transition-colors"
                                    onClick={() => window.open(image.url, "_blank")}
                                  >
                                    <img
                                      src={image.url || "/placeholder.svg"}
                                      alt={`Feedback attachment ${index + 1}`}
                                      className="w-full h-20 sm:h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Eye className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Admin Response */}
                          {feedback.adminResponse && (
                            <div className="border-l-4 border-teal-500 bg-slate-800/50 p-4 rounded-r-lg">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                                <div className="flex items-center gap-2">
                                  <Reply className="h-4 w-4 text-teal-400" />
                                  <span className="text-sm font-medium text-teal-400">Admin Response</span>
                                </div>
                                <div className="text-xs text-slate-500">{adminResponseDateTime?.full}</div>
                              </div>
                              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                                {feedback.adminResponse.message}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 mt-4 border-t border-slate-700/50 gap-2">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="h-4 w-4" />
                            <span>{dateTime.full}</span>
                            <span>•</span>
                            <span>{dateTime.timeAgo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {feedback.adminResponse ? (
                              <div className="flex items-center gap-1 text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm font-medium">Responded</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">Pending Response</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No feedback found</h3>
                  <p className="text-slate-400">
                    {searchQuery ? "Try adjusting your search terms" : "No feedback messages yet"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-4 sm:px-6 py-4 bg-slate-800 rounded-b-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-slate-400 gap-2">
            <div>
              {activeTab === "notifications" ? (
                <span>Showing {filteredSystemNotifications.length} system notifications</span>
              ) : (
                <span>
                  Showing {filteredFeedbacks.length} of {feedbacks.length} feedback messages
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">Press ESC to close</span>
              <Button onClick={onClose} size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
