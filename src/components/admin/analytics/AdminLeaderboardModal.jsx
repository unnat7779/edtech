"use client"

import { useState, useEffect } from "react"
import { X, Trophy, Clock, Users, Download, Search, Medal, Award, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"

export default function AdminLeaderboardModal({
  testId,
  testTitle,
  isOpen,
  onClose,
  highlightUserId = null,
  studentName = null,
}) {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState(null)
  const itemsPerPage = 10

  useEffect(() => {
    if (isOpen && testId) {
      fetchLeaderboardData()
    }
  }, [isOpen, testId])

  const fetchLeaderboardData = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `/api/admin/analytics/leaderboard/${testId}?includeUser=${highlightUserId || ""}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        console.log("Admin leaderboard data:", data)
        setLeaderboardData(data.leaderboard || [])
        setStats(data.stats || {})

        // If we have a highlighted user, scroll to their position
        if (highlightUserId && data.leaderboard) {
          const userIndex = data.leaderboard.findIndex(
            (entry) => entry.student._id.toString() === highlightUserId.toString(),
          )
          if (userIndex !== -1) {
            const userPage = Math.ceil((userIndex + 1) / itemsPerPage)
            setCurrentPage(userPage)
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || `Failed to fetch leaderboard data (${response.status})`)
      }
    } catch (error) {
      console.error("Error fetching admin leaderboard data:", error)
      setError(`Network error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const exportLeaderboard = () => {
    const csvContent = [
      [
        "Rank",
        "Name",
        "Email",
        "Total Score",
        "Percentage",
        "Physics",
        "Chemistry",
        "Mathematics",
        "Time Taken",
        "JEE Percentile",
      ],
      ...filteredData.map((student) => [
        student.rank,
        student.student.name,
        student.student.email,
        student.score?.obtained || 0,
        (student.score?.percentage || 0).toFixed(2) + "%",
        student.pcmScores?.physics?.score || 0,
        student.pcmScores?.chemistry?.score || 0,
        student.pcmScores?.mathematics?.score || 0,
        formatTime(student.totalTime || 0),
        (student.percentile || 0).toFixed(2) + "%",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${testTitle || "test"}_admin_leaderboard.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatTime = (seconds) => {
    if (!seconds) return "0m"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-slate-400 font-bold">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-900"
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-gray-900"
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-amber-900"
      default:
        return "bg-slate-600 text-slate-200"
    }
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return "text-emerald-400"
    if (percentage >= 75) return "text-blue-400"
    if (percentage >= 60) return "text-yellow-400"
    if (percentage >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const isHighlightedUser = (entry) => {
    return highlightUserId && entry.student._id.toString() === highlightUserId.toString()
  }

  const filteredData = leaderboardData.filter(
    (student) =>
      student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div>
            <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-400" />
              Test Leaderboard
            </h2>
            <p className="text-slate-400 mt-1">{testTitle}</p>
            {studentName && highlightUserId && (
              <div className="flex items-center gap-2 mt-2">
                <Target className="h-4 w-4 text-teal-400" />
                <span className="text-sm text-teal-400">Highlighting: {studentName}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportLeaderboard}
              disabled={loading || filteredData.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="p-6 border-b border-slate-700 bg-slate-800/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-slate-200">{stats.totalStudents || 0}</div>
                  <div className="text-sm text-slate-400">Total Students</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-slate-200">{Math.round(stats.averageScore || 0)}</div>
                  <div className="text-sm text-slate-400">Average Score</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <Award className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-slate-200">{stats.topScore || 0}</div>
                  <div className="text-sm text-slate-400">Top Score</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-slate-200">{formatTime(stats.averageTime || 0)}</div>
                  <div className="text-sm text-slate-400">Avg Time</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/30">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="text-sm text-slate-400">
              Showing {paginatedData.length} of {filteredData.length} students
            </div>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="overflow-y-auto max-h-[50vh] p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
              <div className="text-slate-400">Loading leaderboard...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">Error loading leaderboard</div>
              <div className="text-slate-400 mb-4">{error}</div>
              <button
                onClick={fetchLeaderboardData}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <div className="text-slate-400">
                {searchTerm ? "No students found matching your search" : "No students found"}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedData.map((entry) => {
                const isHighlighted = isHighlightedUser(entry)
                return (
                  <div
                    key={entry._id}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                      isHighlighted
                        ? "bg-gradient-to-r from-teal-900/40 to-blue-900/40 border-teal-400/60 shadow-lg shadow-teal-500/20 ring-2 ring-teal-500/30"
                        : "bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(
                          entry.rank,
                        )}`}
                      >
                        {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-200 truncate">{entry.student.name}</h3>
                          {isHighlighted && (
                            <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full border border-teal-500/30 flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Target Student
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400 truncate">{entry.student.email}</div>
                        {entry.student.batch && <div className="text-xs text-slate-500">{entry.student.batch}</div>}
                      </div>

                      {/* Scores - Responsive Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-center">
                        {/* Total Score */}
                        <div className={`rounded-lg p-3 ${isHighlighted ? "bg-teal-800/30" : "bg-slate-800/50"}`}>
                          <div className={`text-lg font-bold ${getPerformanceColor(entry.score?.percentage || 0)}`}>
                            {entry.score?.obtained || 0}
                          </div>
                          <div className="text-xs text-slate-400">Total</div>
                          <div className="text-xs text-slate-500">{(entry.score?.percentage || 0).toFixed(1)}%</div>
                        </div>

                        {/* Physics */}
                        <div className={`rounded-lg p-3 ${isHighlighted ? "bg-teal-800/30" : "bg-slate-800/50"}`}>
                          <div className="text-sm font-bold text-blue-400">{entry.pcmScores?.physics?.score || 0}</div>
                          <div className="text-xs text-slate-400">Physics</div>
                          <div className="text-xs text-slate-500">
                            {(entry.pcmScores?.physics?.percentage || 0).toFixed(1)}%
                          </div>
                        </div>

                        {/* Chemistry */}
                        <div className={`rounded-lg p-3 ${isHighlighted ? "bg-teal-800/30" : "bg-slate-800/50"}`}>
                          <div className="text-sm font-bold text-green-400">
                            {entry.pcmScores?.chemistry?.score || 0}
                          </div>
                          <div className="text-xs text-slate-400">Chemistry</div>
                          <div className="text-xs text-slate-500">
                            {(entry.pcmScores?.chemistry?.percentage || 0).toFixed(1)}%
                          </div>
                        </div>

                        {/* Mathematics */}
                        <div className={`rounded-lg p-3 ${isHighlighted ? "bg-teal-800/30" : "bg-slate-800/50"}`}>
                          <div className="text-sm font-bold text-yellow-400">
                            {entry.pcmScores?.mathematics?.score || 0}
                          </div>
                          <div className="text-xs text-slate-400">Maths</div>
                          <div className="text-xs text-slate-500">
                            {(entry.pcmScores?.mathematics?.percentage || 0).toFixed(1)}%
                          </div>
                        </div>

                        {/* Time & Percentile */}
                        <div className={`rounded-lg p-3 ${isHighlighted ? "bg-teal-800/30" : "bg-slate-800/50"}`}>
                          <div className="text-sm font-bold text-purple-400">{formatTime(entry.totalTime || 0)}</div>
                          <div className="text-xs text-slate-400">Time</div>
                          <div className="text-xs text-slate-500">{(entry.percentile || 0).toFixed(1)}%ile</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              {highlightUserId && <span className="text-teal-400">Target student highlighted •</span>} Showing{" "}
              {paginatedData.length} of {filteredData.length} students
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
