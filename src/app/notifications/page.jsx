"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Bell, MessageSquare, Filter, RefreshCw, CheckCircle, Home, History, Eye } from "lucide-react"
import FeedbackCard from "@/components/feedback/FeedbackCard"
import FeedbackHistoryModal from "@/components/feedback/FeedbackHistoryModal"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, unread, read
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // Fetch notifications and feedbacks in parallel
      const [notificationsRes, feedbacksRes] = await Promise.all([
        fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/feedback?limit=10&includeReplies=true", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (notificationsRes.ok) {
        const notificationData = await notificationsRes.json()
        setNotifications(notificationData.notifications || [])
      }

      if (feedbacksRes.ok) {
        const feedbackData = await feedbacksRes.json()
        setFeedbacks(feedbackData.feedbacks || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read
    if (filter === "read") return notification.read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowHistoryModal(true)}>
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card variant="secondary" className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">Filter:</span>
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* System Notifications */}
            {filteredNotifications.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-teal-400" />
                  System Notifications
                </h2>
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      variant="primary"
                      className={`transition-all duration-200 ${
                        !notification.read ? "border-teal-500/30 shadow-lg shadow-teal-500/10" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`w-3 h-3 rounded-full mt-2 ${
                                !notification.read ? "bg-teal-400 animate-pulse" : "bg-slate-600"
                              }`}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-200 mb-1">{notification.title}</h3>
                              <p className="text-slate-300 text-sm mb-2">{notification.message}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {!notification.read && (
                            <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                              <Eye className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Messages */}
            <div>
              <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-400" />
                Recent Feedback & Responses
              </h2>
              {feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <FeedbackCard key={feedback.id} feedback={feedback} isHistoryView={true} />
                  ))}
                </div>
              ) : (
                <Card variant="primary">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No feedback messages</h3>
                    <p className="text-slate-400">You haven't submitted any feedback yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Empty State */}
            {filteredNotifications.length === 0 && feedbacks.length === 0 && (
              <Card variant="primary">
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No notifications</h3>
                  <p className="text-slate-400">
                    {filter === "unread"
                      ? "No unread notifications found."
                      : "You're all caught up! No notifications to show."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Feedback History Modal */}
      <FeedbackHistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
    </div>
  )
}
