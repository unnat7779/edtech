"use client"

import { useState, useEffect } from "react"
import { X, Trophy, Clock, Users, Download, Search, Medal, Award, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"

export default function LeaderboardModal({ testId, testTitle, isOpen, onClose, currentUserRank }) {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState(null)
  const [mounted, setMounted] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && testId) {
      fetchLeaderboardData()
    }
  }, [isOpen, testId])

  const fetchLeaderboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${testId}/leaderboard?includeCurrentUser=true&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setLeaderboardData(data.leaderboard || [])
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportLeaderboard = () => {
    const csvContent = [
      ["Rank", "Name", "Total Score", "Physics", "Chemistry", "Mathematics", "Time Taken", "JEE Percentile"],
      ...filteredData.map((student) => [
        student.rank,
        student.student.name,
        student.score?.obtained || 0,
        student.pcmScores?.physics?.score || 0,
        student.pcmScores?.chemistry?.score || 0,
        student.pcmScores?.mathematics?.score || 0,
        Math.round((student.totalTime || 0) / 60) + " min",
        student.percentile + "%",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${testTitle}_leaderboard.csv`
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
        return <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
      case 2:
        return <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
      case 3:
        return <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
      default:
        return <span className="text-slate-400 font-bold text-sm sm:text-base">#{rank}</span>
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

  const filteredData = leaderboardData.filter((student) =>
    student.student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  if (!isOpen || !mounted) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-200 flex items-center gap-2 sm:gap-3">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 shrink-0" />
              <span className="truncate">Leaderboard</span>
            </h2>
            <p className="text-slate-400 mt-1 text-sm sm:text-base truncate">{testTitle}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Export button - Hidden on very small screens */}
            <button
              onClick={exportLeaderboard}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Export CSV</span>
            </button>
            {/* Mobile export button */}
            <button
              onClick={exportLeaderboard}
              className="sm:hidden p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
              aria-label="Export CSV"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Stats Cards - Mobile Responsive */}
        {stats && (
          <div className="p-3 sm:p-6 border-b border-slate-700 bg-slate-800/50 shrink-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-3 sm:p-4 text-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-lg sm:text-xl font-bold text-slate-200">{stats.totalStudents}</div>
                  <div className="text-xs sm:text-sm text-slate-400">Total Students</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-3 sm:p-4 text-center">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-lg sm:text-xl font-bold text-slate-200">{Math.round(stats.averageScore)}</div>
                  <div className="text-xs sm:text-sm text-slate-400">Average Score</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-3 sm:p-4 text-center">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mx-auto mb-2" />
                  <div className="text-lg sm:text-xl font-bold text-slate-200">{stats.topScore}</div>
                  <div className="text-xs sm:text-sm text-slate-400">Top Score</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-3 sm:p-4 text-center">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-lg sm:text-xl font-bold text-slate-200">{formatTime(stats.averageTime)}</div>
                  <div className="text-xs sm:text-sm text-slate-400">Avg Time</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Search and Filters - Mobile Optimized */}
        <div className="p-3 sm:p-6 border-b border-slate-700 bg-slate-800/30 shrink-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
              />
            </div>
            <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-right">
              Showing {paginatedData.length} of {filteredData.length} students
            </div>
          </div>
        </div>

        {/* Leaderboard Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
              <div className="text-slate-400 text-sm sm:text-base">Loading leaderboard...</div>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto mb-4" />
              <div className="text-slate-400 text-sm sm:text-base">No students found</div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {paginatedData.map((entry) => (
                <div
                  key={entry._id}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 hover:shadow-lg ${
                    entry.isCurrentUser
                      ? "bg-gradient-to-r from-teal-900/30 to-blue-900/30 border-teal-500/50 shadow-lg shadow-teal-500/10"
                      : "bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50"
                  }`}
                >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Rank Badge */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${getRankBadgeColor(
                          entry.rank,
                        )}`}
                      >
                        {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-200 truncate text-sm">
                            {entry.isCurrentUser ? "You" : entry.student.name}
                          </h3>
                          {entry.isCurrentUser && (
                            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full border border-teal-500/30">
                              You
                            </span>
                          )}
                        </div>
                        {entry.student.batch && <div className="text-xs text-slate-500">{entry.student.batch}</div>}
                      </div>

                      {/* Total Score - Prominent */}
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getPerformanceColor(entry.score.percentage)}`}>
                          {entry.score.obtained}
                        </div>
                        <div className="text-xs text-slate-400">{entry.score.percentage.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* Subject Scores - 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-blue-400">{entry.pcmScores?.physics?.score || 0}</div>
                        <div className="text-xs text-slate-400">Physics</div>
                        <div className="text-xs text-slate-500">
                          {(entry.pcmScores?.physics?.percentage || 0).toFixed(0)}%
                        </div>
                      </div>

                      <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-green-400">{entry.pcmScores?.chemistry?.score || 0}</div>
                        <div className="text-xs text-slate-400">Chemistry</div>
                        <div className="text-xs text-slate-500">
                          {(entry.pcmScores?.chemistry?.percentage || 0).toFixed(0)}%
                        </div>
                      </div>

                      <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-yellow-400">
                          {entry.pcmScores?.mathematics?.score || 0}
                        </div>
                        <div className="text-xs text-slate-400">Maths</div>
                        <div className="text-xs text-slate-500">
                          {(entry.pcmScores?.mathematics?.percentage || 0).toFixed(0)}%
                        </div>
                      </div>

                      <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-purple-400">{formatTime(entry.totalTime)}</div>
                        <div className="text-xs text-slate-400">Time</div>
                        <div className="text-xs text-slate-500">{entry.percentile.toFixed(0)}%ile</div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center gap-4">
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
                        <h3 className="font-semibold text-slate-200 truncate">
                          {entry.isCurrentUser ? "You" : entry.student.name}
                        </h3>
                        {entry.isCurrentUser && (
                          <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full border border-teal-500/30">
                            You
                          </span>
                        )}
                      </div>
                      {entry.student.batch && <div className="text-xs text-slate-500">{entry.student.batch}</div>}
                    </div>

                    {/* Scores - Desktop Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-center">
                      {/* Total Score */}
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className={`text-lg font-bold ${getPerformanceColor(entry.score.percentage)}`}>
                          {entry.score.obtained}
                        </div>
                        <div className="text-xs text-slate-400">Total</div>
                        <div className="text-xs text-slate-500">{entry.score.percentage.toFixed(1)}%</div>
                      </div>

                      {/* Physics */}
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-sm font-bold text-blue-400">{entry.pcmScores?.physics?.score || 0}</div>
                        <div className="text-xs text-slate-400">Physics</div>
                        <div className="text-xs text-slate-500">
                          {(entry.pcmScores?.physics?.percentage || 0).toFixed(1)}%
                        </div>
                      </div>

                      {/* Chemistry */}
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-sm font-bold text-green-400">{entry.pcmScores?.chemistry?.score || 0}</div>
                        <div className="text-xs text-slate-400">Chemistry</div>
                        <div className="text-xs text-slate-500">
                          {(entry.pcmScores?.chemistry?.percentage || 0).toFixed(1)}%
                        </div>
                      </div>

                      {/* Mathematics */}
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-sm font-bold text-yellow-400">
                          {entry.pcmScores?.mathematics?.score || 0}
                        </div>
                        <div className="text-xs text-slate-400">Maths</div>
                        <div className="text-xs text-slate-500">
                          {(entry.pcmScores?.mathematics?.percentage || 0).toFixed(1)}%
                        </div>
                      </div>

                      {/* Time */}
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-sm font-bold text-purple-400">{formatTime(entry.totalTime)}</div>
                        <div className="text-xs text-slate-400">Time</div>
                        <div className="text-xs text-slate-500">{entry.percentile.toFixed(1)}%ile</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination - Mobile Optimized */}
        {totalPages > 1 && (
          <div className="p-3 sm:p-4 border-t border-slate-700/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-1 bg-slate-700 text-slate-300 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-1 bg-slate-700 text-slate-300 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Mobile Optimized */}
        <div className="p-3 sm:p-6 border-t border-slate-700 bg-slate-800/50 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
              Showing {paginatedData.length} of {filteredData.length} students
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm sm:text-base"
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
