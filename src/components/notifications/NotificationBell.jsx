"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import NotificationModal from "./NotificationModal"

export default function NotificationBell() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [systemNotifications, setSystemNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSystemNotifications()
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchSystemNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchSystemNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/system-notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSystemNotifications(data.notifications || [])
        const unread = (data.notifications || []).filter((n) => !n.isRead).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Error fetching system notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchSystemNotifications()
  }

  return (
    <>
      {/* Bell Icon - No box, just the bell with notification badge */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative p-2 h-10 w-10 bg-opacity-20 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-teal-500/300 "
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-6 w-6" />

        {/* Notification Badge - Positioned on the bell */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Loading indicator */}
        {/* {loading && <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-400 rounded-full animate-ping" />} */}
      </button>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        systemNotifications={systemNotifications}
        onRefresh={handleRefresh}
      />
    </>
  )
}
