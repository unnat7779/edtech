"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, RefreshCw } from "lucide-react"
import StudentSessionCard from "@/components/student/doubt-sessions/StudentSessionCard"
import Button from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { getStoredUser } from "@/lib/auth-utils"
import { toast } from "react-hot-toast"

export default function StudentDoubtSessionsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const userData = getStoredUser()
    if (userData && userData.role === "student") {
      setUser(userData)
      fetchSessions()
    } else {
      router.push("/login")
    }
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/doubt-sessions", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/login")
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSessions(data.sessions || [])
      } else {
        setError(data.error || "Failed to fetch sessions")
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
      setError("Network error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (sessionId) => {
    try {
      const token = localStorage.getItem("token")
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
        toast.success("Response marked as read!")
      } else {
        throw new Error(data.error || "Failed to mark as read")
      }
    } catch (error) {
      console.error("Error marking as read:", error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    // Redirect to the new session history page
    router.replace("/student/sessions")
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-md shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">My Doubt Sessions</h1>
              <p className="text-slate-400 mt-1">Track your doubt sessions and responses</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-slate-300 border-slate-600"
              >
                ← Back to Dashboard
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchSessions}
                className="text-blue-400 border-blue-400"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 animate-pulse"
              >
                <div className="h-4 bg-slate-700 rounded mb-4"></div>
                <div className="h-3 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded mb-4"></div>
                <div className="h-8 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border-red-500/50">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-300">Error Loading Sessions</h3>
                  <p className="text-red-400 mt-1">{error}</p>
                  <Button
                    onClick={fetchSessions}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : sessions.length === 0 ? (
          <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Sessions Found</h3>
              <p className="text-slate-400 mb-4">You haven't submitted any doubt sessions yet.</p>
              <Button onClick={() => router.push("/book-session")} className="bg-blue-600 hover:bg-blue-700 text-white">
                Book Your First Session
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => (
              <StudentSessionCard key={session._id} session={session} onMarkRead={handleMarkAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
