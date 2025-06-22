"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, RefreshCw, Grid3X3, List, CalendarIcon, AlertCircle } from "lucide-react"
import SessionCard from "@/components/admin/doubt-sessions/SessionCard"
import AdminResponseModal from "@/components/admin/doubt-sessions/AdminResponseModal"
import SessionFilters from "@/components/admin/doubt-sessions/SessionFilters"
import SessionStatistics from "@/components/admin/doubt-sessions/SessionStatistics"
import SessionCalendar from "@/components/admin/doubt-sessions/SessionCalendar"
import LoadingSkeletons from "@/components/admin/doubt-sessions/LoadingSkeletons"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { getStoredUser } from "@/lib/auth-utils"
import { toast } from "react-hot-toast"

export default function AdminDoubtSessionsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    subject: "all",
    dateRange: { start: null, end: null },
  })
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const userData = getStoredUser()
    console.log("=== Page Load ===")
    console.log("User data:", userData)

    if (userData && userData.role === "admin") {
      setUser(userData)
      fetchSessions()
      fetchStats()
    } else {
      console.log("Not admin user, redirecting to login")
      router.push("/login")
    }
  }, [])

  useEffect(() => {
    if (user) {
      console.log("Filters changed, refetching...")
      fetchSessions()
    }
  }, [filters, searchQuery, user, selectedDate])

  const fetchSessions = async () => {
    try {
      console.log("=== Fetching Sessions ===")
      setLoading(true)
      setError("")

      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        console.log("❌ No token found, redirecting to login")
        router.push("/login")
        return
      }

      const params = new URLSearchParams({
        status: filters.status,
        subject: filters.subject,
        search: searchQuery,
      })

      // Add date filters
      if (selectedDate) {
        // Handle both string and Date object
        const dateStr = typeof selectedDate === "string" ? selectedDate : selectedDate.toISOString().split("T")[0]
        params.append("date", dateStr)
      } else if (filters.dateRange.start || filters.dateRange.end) {
        if (filters.dateRange.start) params.append("startDate", filters.dateRange.start)
        if (filters.dateRange.end) params.append("endDate", filters.dateRange.end)
      }

      const url = `/api/admin/doubt-sessions?${params}`
      console.log("📡 Request URL:", url)
      console.log("🔑 Using token:", token ? "Present" : "Missing")

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        if (response.status === 401) {
          console.log("❌ Unauthorized, clearing token and redirecting")
          localStorage.removeItem("token")
          router.push("/login")
          return
        }

        const errorText = await response.text()
        console.error("❌ API Error Response:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const responseText = await response.text()
      console.log("📡 Raw response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError)
        setError("Invalid response format")
        return
      }

      console.log("✅ Parsed response data:", data)

      if (data.success) {
        setSessions(data.sessions || [])
        setError("")
        console.log("✅ Sessions loaded successfully:", data.sessions?.length || 0)
      } else {
        console.error("❌ API Error:", data)
        setError(data.error || "Failed to fetch sessions")
        toast.error(data.error || "Failed to fetch sessions")
      }
    } catch (error) {
      console.error("❌ Network error:", error)
      setError("Network error: " + error.message)
      toast.error("Network error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log("=== Fetching Stats ===")

      const token = localStorage.getItem("token")
      if (!token) {
        console.log("❌ No token for stats")
        return
      }

      const response = await fetch("/api/admin/doubt-sessions/stats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📊 Stats response status:", response.status)

      if (!response.ok) {
        console.error("❌ Stats fetch failed:", response.status)
        return
      }

      const responseText = await response.text()
      console.log("📊 Stats raw response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Stats JSON parse error:", parseError)
        return
      }

      console.log("📊 Stats parsed data:", data)

      if (data.success) {
        setStats(data.stats || {})
        console.log("✅ Stats loaded successfully:", data.stats)
      } else {
        console.error("❌ Stats error:", data)
        toast.error("Failed to fetch statistics")
      }
    } catch (error) {
      console.error("❌ Stats network error:", error)
      toast.error("Failed to fetch statistics")
    }
  }

  const handleSessionResponse = (session) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedSession(null)
  }

  const handleModalSuccess = () => {
    handleModalClose()
    fetchSessions()
    fetchStats()
    toast.success("Session response sent successfully!")
  }

  const handleStatusUpdate = async (sessionId, status) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/admin/doubt-sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchSessions()
        fetchStats()
        toast.success("Session status updated successfully!")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to update session status")
      }
    } catch (error) {
      console.error("Failed to update session status:", error)
      toast.error("Failed to update session status")
    }
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setShowCalendar(false)
  }

  const clearDateSelection = () => {
    setSelectedDate(null)
  }

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
              <h1 className="text-3xl font-bold text-white">Doubt Session Management</h1>
              <p className="text-slate-400 mt-1">Manage and respond to student doubt sessions</p>
              {selectedDate && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-blue-400">
                    Showing sessions for:{" "}
                    {typeof selectedDate === "string"
                      ? new Date(selectedDate + "T00:00:00").toLocaleDateString()
                      : selectedDate.toLocaleDateString()}
                  </span>
                  <button onClick={clearDateSelection} className="text-xs text-slate-400 hover:text-white underline">
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin")}
                className="text-slate-300 border-slate-600"
              >
                ← Back to Dashboard
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchSessions()
                  fetchStats()
                }}
                className="text-blue-400 border-blue-400"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-green-400 border-green-400"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {showCalendar ? "Hide Calendar" : "Show Calendar"}
              </Button>

              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SessionStatistics stats={stats} />
      </div>

      {/* Calendar */}
      {showCalendar && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <SessionCalendar onDateSelect={handleDateSelect} selectedDate={selectedDate} sessions={sessions} />
        </div>
      )}

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-lg p-6 mb-6 border border-slate-700/50">
          <div className="flex flex-col lg:flex-row gap-4 ">
            <div className="flex-1">
              <Input
                placeholder="Search by student name, topic, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="w-full"
              />
            </div>
            <SessionFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingSkeletons count={6} />
        ) : error ? (
          /* Error State */
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
          /* Empty State */
          <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Sessions Found</h3>
              <p className="text-slate-400 mb-4">
                {searchQuery || filters.status !== "all" || filters.subject !== "all" || selectedDate
                  ? "No sessions match your current filters."
                  : "No doubt sessions have been submitted yet."}
              </p>
              {(searchQuery || filters.status !== "all" || filters.subject !== "all" || selectedDate) && (
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setFilters({ status: "all", subject: "all", dateRange: { start: null, end: null } })
                    setSelectedDate(null)
                  }}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          /* Sessions Grid/List */
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {sessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                onRespond={handleSessionResponse}
                onStatusUpdate={handleStatusUpdate}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Admin Response Modal */}
      <AdminResponseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        session={selectedSession}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
