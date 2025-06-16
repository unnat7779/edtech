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
  Check,
  Filter,
  Megaphone,
  Reply,
  Sparkles,
  Star,
  Zap,
} from "lucide-react"
import FeedbackCard from "@/components/feedback/FeedbackCard"

export default function NotificationModal({ isOpen, onClose, systemNotifications = [], onRefresh }) {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("notifications")
  const [systemFilter, setSystemFilter] = useState("all") // all, admin-reply, announcement
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

  const getNotificationIcon = (type, notificationType, priority) => {
    if (notificationType === "announcement") {
      switch (priority) {
        case "urgent":
          return <Zap className="h-5 w-5 text-red-400" />
        case "high":
          return <Star className="h-5 w-5 text-orange-400" />
        default:
          return <Megaphone className="h-5 w-5 text-blue-400" />
      }
    } else if (notificationType === "admin-reply") {
      return <Reply className="h-4 w-4 text-green-400" />
    }

    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Bell className="h-4 w-4 text-teal-400" />
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return "Just now"
  }

  const unreadSystemCount = filteredSystemNotifications.filter((n) => !n.isRead).length
  const totalSystemCount = filteredSystemNotifications.length

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2147483647] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20">
              <Bell className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Notifications</h2>
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
                className={`transition-all duration-300 ${markingAllAsRead ? "animate-pulse" : ""}`}
              >
                {markingAllAsRead ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-400 border-t-transparent mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {markingAllAsRead ? "Marking..." : "Mark All Read"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onRefresh}>
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
          <div className="flex items-center justify-between px-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "notifications"
                    ? "border-teal-400 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <Bell className="h-4 w-4 mr-2 inline" />
                System ({unreadSystemCount})
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "feedback"
                    ? "border-teal-400 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2 inline" />
                Feedback ({feedbacks.length})
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {activeTab === "notifications" && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <select
                    value={systemFilter}
                    onChange={(e) => setSystemFilter(e.target.value)}
                    className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All</option>
                    <option value="admin-reply">Admin Replies</option>
                    <option value="announcement">Announcements</option>
                  </select>
                </div>
              )}

              {activeTab === "feedback" && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-48"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50" style={{ maxHeight: "calc(85vh - 200px)" }}>
          {activeTab === "notifications" ? (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
                  <span className="ml-3 text-slate-400">Loading notifications...</span>
                </div>
              ) : filteredSystemNotifications.length > 0 ? (
                filteredSystemNotifications.map((notification) => {
                  const isMarking = markingAsRead.has(notification.id)
                  const isRead = notification.isRead
                  const isAnnouncement = notification.type === "announcement"

                  if (isAnnouncement) {
                    // Special announcement design
                    return (
                      <div
                        key={notification.id}
                        className={`relative overflow-hidden rounded-xl transition-all duration-500 ${
                          isMarking
                            ? "animate-pulse scale-[0.98] opacity-75"
                            : isRead
                              ? "bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/50 opacity-70"
                              : "bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-teal-900/30 border border-blue-500/30 shadow-2xl shadow-blue-900/20"
                        }`}
                      >
                        {/* Animated background for unread announcements */}
                        {!isRead && !isMarking && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 animate-pulse" />
                        )}

                        {/* NEW ANNOUNCEMENT Badge */}
                        {!isRead && (
                          <div className="absolute top-4 right-4 z-10">
                            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                              <Sparkles className="h-3 w-3" />
                              NEW ANNOUNCEMENT
                            </div>
                          </div>
                        )}

                        <div className="relative p-6">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div
                              className={`p-3 rounded-full ${
                                isRead
                                  ? "bg-slate-700/50"
                                  : notification.priority === "urgent"
                                    ? "bg-red-500/20 border border-red-500/30"
                                    : notification.priority === "high"
                                      ? "bg-orange-500/20 border border-orange-500/30"
                                      : "bg-blue-500/20 border border-blue-500/30"
                              } flex-shrink-0`}
                            >
                              {getNotificationIcon(notification.priority, notification.type, notification.priority)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3
                                    className={`text-xl font-bold mb-2 transition-colors ${
                                      isRead ? "text-slate-400" : "text-white"
                                    }`}
                                  >
                                    {notification.title}
                                  </h3>
                                  <div className="flex items-center gap-3 text-sm">
                                    <div
                                      className={`flex items-center gap-1 ${
                                        isRead ? "text-slate-500" : "text-slate-300"
                                      }`}
                                    >
                                      <Clock className="h-3 w-3" />
                                      {formatTimeAgo(notification.createdAt)}
                                    </div>
                                    {notification.priority && (
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                                          notification.priority === "urgent"
                                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                            : notification.priority === "high"
                                              ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                        }`}
                                      >
                                        {notification.priority.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {!isRead && !isMarking && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full animate-pulse shadow-lg" />
                                  </div>
                                )}
                                {isMarking && (
                                  <div className="w-3 h-3 bg-green-400 rounded-full animate-ping shadow-lg" />
                                )}
                              </div>

                              <p
                                className={`text-base leading-relaxed mb-4 transition-colors ${
                                  isRead ? "text-slate-400" : "text-slate-100"
                                }`}
                              >
                                {notification.message}
                              </p>

                              {notification.description && (
                                <p
                                  className={`text-sm leading-relaxed mb-4 transition-colors ${
                                    isRead ? "text-slate-500" : "text-slate-300"
                                  }`}
                                >
                                  {notification.description}
                                </p>
                              )}

                              {/* Images */}
                              {notification.images && notification.images.length > 0 && (
                                <div className="flex gap-3 mb-4">
                                  {notification.images.slice(0, 3).map((image, index) => (
                                    <img
                                      key={index}
                                      src={image.url || "/placeholder.svg"}
                                      alt={`Attachment ${index + 1}`}
                                      className="w-20 h-20 object-cover rounded-lg border border-slate-600 hover:scale-105 transition-transform cursor-pointer"
                                      onClick={() => window.open(image.url, "_blank")}
                                    />
                                  ))}
                                  {notification.images.length > 3 && (
                                    <div className="w-20 h-20 bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center text-xs text-slate-400">
                                      +{notification.images.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Action Button */}
                              <div className="flex items-center justify-between">
                                <div></div>
                                {!isRead && (
                                  <Button
                                    onClick={() => markAsRead(notification.id, notification.type)}
                                    disabled={isMarking}
                                    className={`bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0 shadow-lg transition-all duration-300 ${
                                      isMarking ? "animate-pulse scale-95" : "hover:scale-105 hover:shadow-xl"
                                    }`}
                                  >
                                    {isMarking ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                        Reading...
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Mark as Read
                                      </>
                                    )}
                                  </Button>
                                )}
                                {isRead && (
                                  <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-sm font-medium">Read</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  } else {
                    // Regular notification design for admin replies
                    return (
                      <Card
                        key={notification.id}
                        variant="secondary"
                        className={`transition-all duration-500 hover:shadow-lg ${
                          isMarking
                            ? "animate-pulse scale-[0.98] opacity-75"
                            : isRead
                              ? "bg-slate-800/40 border-slate-600/50 opacity-60"
                              : "border-teal-500/30 bg-slate-700/80 shadow-lg shadow-teal-900/5 hover:bg-slate-700/60"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.priority, notification.type, notification.priority)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4
                                  className={`font-medium text-sm transition-colors ${
                                    isRead ? "text-slate-400" : "text-slate-200"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Clock className="h-3 w-3" />
                                    {formatTimeAgo(notification.createdAt)}
                                  </div>
                                  {!isRead && !isMarking && (
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                                  )}
                                  {isMarking && <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />}
                                </div>
                              </div>
                              <p
                                className={`text-sm leading-relaxed transition-colors ${
                                  isRead ? "text-slate-400" : "text-slate-300"
                                }`}
                              >
                                {notification.message}
                              </p>

                              <div className="flex items-center gap-2 mt-3">
                                {!isRead && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id, notification.type)}
                                    disabled={isMarking}
                                    className={`text-green-400 border-green-500/30 hover:bg-green-500/10 transition-all duration-300 ${
                                      isMarking ? "animate-pulse scale-95" : "hover:scale-105"
                                    }`}
                                  >
                                    {isMarking ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-400 border-t-transparent mr-2" />
                                        Reading...
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-3 w-3 mr-2" />
                                        Mark as Read
                                      </>
                                    )}
                                  </Button>
                                )}
                                {isRead && (
                                  <div className="flex items-center gap-1 text-xs text-green-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Read
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }
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
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
                  <span className="ml-3 text-slate-400">Loading feedback...</span>
                </div>
              ) : filteredFeedbacks.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredFeedbacks.map((feedback) => (
                    <FeedbackCard key={feedback.id} feedback={feedback} isHistoryView={true} />
                  ))}
                </div>
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
        <div className="border-t border-slate-700 px-6 py-4 bg-slate-800 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-slate-400">
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
              <span>Press ESC to close</span>
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
