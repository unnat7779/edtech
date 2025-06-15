"use client"
//   ChevronUp,

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  BookOpen,
  BarChart3,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Minus,
  Timer,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Brain,
  Atom,
  Beaker,
  Calculator,
} from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function TestHistoryDashboard({ testId, onClose }) {
  const router = useRouter()
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedCards, setExpandedCards] = useState(new Set())

  const getSubjectConfig = (subject) => {
    const configs = {
      Physics: {
        icon: Atom,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
        gradientFrom: "from-blue-500",
        gradientTo: "to-blue-600",
      },
      Chemistry: {
        icon: Beaker,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/20",
        borderColor: "border-emerald-500/30",
        gradientFrom: "from-emerald-500",
        gradientTo: "to-emerald-600",
      },
      Mathematics: {
        icon: Calculator,
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30",
        gradientFrom: "from-purple-500",
        gradientTo: "to-purple-600",
      },
    }
    return configs[subject] || configs.Mathematics
  }

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 80)
      return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" }
    if (percentage >= 60)
      return { label: "Good", color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" }
    if (percentage >= 40)
      return { label: "Average", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" }
    return { label: "Needs Improvement", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" }
  }


  useEffect(() => {
    fetchTestHistory()
  }, [testId])

  const fetchTestHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      console.log("🔍 Fetching test history for testId:", testId)

      const response = await fetch(`/api/test-history/${testId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch test history: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Received history data:", data)
      setHistory(data.history || [])
      setStats(data.stats || {})
    } catch (error) {
      console.error("❌ Error fetching test history:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTimeOfDay = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0 min"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} min`
  }

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return "0s"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ""}`
    } else {
      return `${remainingSeconds}s`
    }
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Completed",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
        }
      case "auto-submitted":
        return {
          icon: <Timer className="h-4 w-4" />,
          label: "Auto-submitted",
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
        }
      default:
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: "Incomplete",
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
        }
    }
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return "text-emerald-400"
    if (percentage >= 60) return "text-blue-400"
    if (percentage >= 40) return "text-amber-400"
    return "text-red-400"
  }

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-emerald-400" />
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-400" />
    return <Minus className="h-3 w-3 text-slate-400" />
  }

  const handleAttemptClick = (attemptId) => {
    router.push(`/analytics/student/${attemptId}`)
  }

  const toggleCardExpansion = (attemptId) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(attemptId)) {
      newExpanded.delete(attemptId)
    } else {
      newExpanded.add(attemptId)
    }
    setExpandedCards(newExpanded)
  }

  // Create analytics data structure for SubjectAnalysis component
  const createAnalyticsDataForAttempt = (attempt) => {
    if (!attempt.subjectWiseScores || attempt.subjectWiseScores.length === 0) {
      return null
    }

    // Transform the attempt data to match the analytics data structure
    const analyticsData = {
      subjectWise: attempt.subjectWiseScores.map((subject) => ({
        subject: subject.subject,
        correct: subject.correct || 0,
        incorrect: subject.incorrect || 0,
        unattempted: subject.unattempted || 0,
        obtainedMarks: subject.obtained || 0,
        totalMarks: subject.total || 0,
        accuracy: subject.percentage || 0,
        percentage: subject.percentage || 0,
        timeSpent: subject.timeSpent || 0,
        averageTimePerQuestion: subject.averageTimePerQuestion || 0,
      })),
      timeAnalytics: {
        timeDistribution: attempt.subjectWiseScores.map((subject) => ({
          subject: subject.subject,
          time: subject.timeSpent || 0,
          timeInSeconds: subject.timeSpent || 0,
          questions: (subject.correct || 0) + (subject.incorrect || 0) + (subject.unattempted || 0),
        })),
        questionTimeDetails: [], // Not needed for this view
      },
    }

    // Create mock attempt and test data for the SubjectAnalysis component
    const mockAttemptData = {
      timeSpent: attempt.timeSpent || 0,
      questionTimeTracking: attempt.questionTimeTracking || [],
      subjectTimeTracking: attempt.subjectTimeTracking || [],
      answers: attempt.answers || [],
    }

    const mockTestData = {
      questions: attempt.test?.questions || [],
    }

    return {
      analyticsData,
      attemptData: mockAttemptData,
      testData: mockTestData,
    }
  }

  const sortedAndFilteredHistory = history
    .filter((attempt) => {
      if (filterStatus === "all") return true
      return attempt.completionStatus === filterStatus
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.startTime)
        const dateB = new Date(b.startTime)
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB
      } else if (sortBy === "score") {
        return sortOrder === "desc" ? b.score.percentage - a.score.percentage : a.score.percentage - b.score.percentage
      }
      return 0
    })

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-200">Loading test history...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-slate-700/50">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Error Loading History</h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={fetchTestHistory} className="flex-1">
                Retry
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button onClick={onClose} variant="outline" className="p-2 shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-200">Test History</h1>
                <p className="text-slate-400 text-sm sm:text-base">
                  {history[0]?.test?.title || "Test"} • {stats?.totalAttempts || 0} attempts
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg shrink-0">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-slate-400">Best Score</p>
                      <p className="text-sm sm:text-lg font-semibold text-slate-200 truncate">
                        {stats.bestScore}/{history[0]?.test?.totalMarks || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-slate-400">Best %</p>
                      <p className="text-sm sm:text-lg font-semibold text-slate-200">
                        {stats.bestPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-slate-400">Average</p>
                      <p className="text-sm sm:text-lg font-semibold text-slate-200">
                        {stats.averagePercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-teal-500/20 rounded-lg shrink-0">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-slate-400">Total Time</p>
                      <p className="text-sm sm:text-lg font-semibold text-slate-200">
                        {formatDuration(stats.totalTimeSpent)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Sorting */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-300 shrink-0">Filter:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 min-w-0 flex-1 sm:flex-none"
                  >
                    <option value="all">All Attempts</option>
                    <option value="completed">Completed</option>
                    <option value="auto-submitted">Auto-submitted</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-300 shrink-0">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 min-w-0 flex-1 sm:flex-none"
                  >
                    <option value="date">Date</option>
                    <option value="score">Score</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                  >
                    {sortOrder === "desc" ? (
                      <SortDesc className="h-4 w-4 text-slate-400" />
                    ) : (
                      <SortAsc className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <Activity className="h-5 w-5" />
                Attempt Timeline ({sortedAndFilteredHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {sortedAndFilteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No attempts found</h3>
                  <p className="text-slate-400 text-sm">
                    {filterStatus !== "all"
                      ? "Try changing the filter to see more attempts."
                      : "Take this test to see your history here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {sortedAndFilteredHistory.map((attempt, index) => {
                    const statusConfig = getStatusConfig(attempt.completionStatus)
                    const isExpanded = expandedCards.has(attempt._id)
                    const analyticsData = createAnalyticsDataForAttempt(attempt)

                    return (
                      <div key={attempt._id} className="relative">
                        {/* Timeline Line */}
                        {index < sortedAndFilteredHistory.length - 1 && (
                          <div className="absolute left-6 sm:left-8 top-20 sm:top-24 w-0.5 h-16 sm:h-20 bg-gradient-to-b from-teal-500/50 to-transparent"></div>
                        )}

                        {/* Main Card */}
                        <div
                          className={`relative bg-slate-800/30 backdrop-blur-sm rounded-xl sm:rounded-2xl border transition-all duration-300 hover:bg-slate-800/50 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 ${statusConfig.borderColor}`}
                        >
                          {/* Card Header */}
                          <div className="p-4 sm:p-6">
                            <div className="flex items-start gap-4">
                              {/* Attempt Number Badge */}
                              <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-sm sm:text-lg font-bold text-white">
                                  #{attempt.attemptNumber}
                                </span>
                              </div>

                              {/* Header Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-200">
                                      Attempt {attempt.attemptNumber}
                                    </h3>
                                    <div
                                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}
                                    >
                                      {statusConfig.icon}
                                      <span className="hidden sm:inline">{statusConfig.label}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Calendar className="h-4 w-4 shrink-0" />
                                    <div className="text-right">
                                      <div className="font-medium">{formatDate(attempt.startTime)}</div>
                                      <div className="text-xs">{formatTimeOfDay(attempt.startTime)}</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                                    <div className="flex items-center justify-center mb-2">
                                      <Award className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <div className="text-lg sm:text-xl font-bold text-emerald-400">
                                      {attempt.score.obtained}
                                    </div>
                                    <div className="text-xs text-slate-400">Score</div>
                                  </div>

                                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                                    <div className="flex items-center justify-center mb-2">
                                      <Target className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div
                                      className={`text-lg sm:text-xl font-bold ${getPerformanceColor(
                                        attempt.score.percentage,
                                      )}`}
                                    >
                                      {attempt.score.percentage.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-slate-400">Percentage</div>
                                  </div>

                                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                                    <div className="flex items-center justify-center mb-2">
                                      <Clock className="h-4 w-4 text-teal-400" />
                                    </div>
                                    <div className="text-lg sm:text-xl font-bold text-teal-400">
                                      {formatTime(attempt.timeSpent)}
                                    </div>
                                    <div className="text-xs text-slate-400">Time</div>
                                  </div>

                                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                                    <div className="flex items-center justify-center mb-2">
                                      <Zap className="h-4 w-4 text-purple-400" />
                                    </div>
                                    <div className="text-lg sm:text-xl font-bold text-purple-400">
                                      {attempt.analysis?.correct || 0}
                                    </div>
                                    <div className="text-xs text-slate-400">Correct</div>
                                  </div>
                                </div>

                                {/* Improvement Indicator */}
                                {index > 0 && attempt.improvement && (
                                  <div className="bg-slate-700/20 rounded-lg p-3 mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <TrendingUp className="h-4 w-4 text-slate-400" />
                                      <span className="text-sm font-medium text-slate-300">
                                        Progress from last attempt
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                      <div className="flex items-center gap-1">
                                        {getTrendIcon(attempt.improvement.scoreChange)}
                                        <span
                                          className={`font-medium ${
                                            attempt.improvement.scoreChange > 0
                                              ? "text-emerald-400"
                                              : attempt.improvement.scoreChange < 0
                                                ? "text-red-400"
                                                : "text-slate-400"
                                          }`}
                                        >
                                          {attempt.improvement.scoreChange > 0 ? "+" : ""}
                                          {attempt.improvement.scoreChange} points
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {getTrendIcon(attempt.improvement.percentageChange)}
                                        <span
                                          className={`font-medium ${
                                            attempt.improvement.percentageChange > 0
                                              ? "text-emerald-400"
                                              : attempt.improvement.percentageChange < 0
                                                ? "text-red-400"
                                                : "text-slate-400"
                                          }`}
                                        >
                                          {attempt.improvement.percentageChange > 0 ? "+" : ""}
                                          {attempt.improvement.percentageChange.toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                  <Button
                                    onClick={() => handleAttemptClick(attempt.attempt)}
                                    className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg"
                                  >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    View Analytics
                                  </Button>
                                  {analyticsData && (
                                    <Button
                                      onClick={() => toggleCardExpansion(attempt._id)}
                                      variant="outline"
                                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >
                                      <Brain className="h-4 w-4 mr-2" />
                                      Subject Details
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 ml-2" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Subject Details - Using SubjectAnalysis Component */}
                           {isExpanded && attempt.subjectWiseScores && attempt.subjectWiseScores.length > 0 && (
                            <div className="border-t border-slate-700/50 bg-slate-800/20">
                              <div className="p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-6">
                                  <h4 className="text-lg font-semibold text-slate-200 flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                      <BookOpen className="h-5 w-5 text-blue-400" />
                                    </div>
                                    Subject-wise Performance
                                  </h4>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                  {attempt.subjectWiseScores.map((subject) => {
                                    const subjectConfig = getSubjectConfig(subject.subject)
                                    const IconComponent = subjectConfig.icon
                                    const accuracy = subject.percentage || 0
                                    const performanceLevel = getPerformanceLevel(accuracy)
                                    const correct = subject.correct || 0
                                    const incorrect = subject.incorrect || 0
                                    const skipped = subject.unattempted || 0
                                    const totalQuestions = correct + incorrect + skipped
                                    const timeSpent = subject.timeSpent || 0

                                    return (
                                      <div
                                        key={subject.subject}
                                        className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300"
                                      >
                                        {/* Subject Header */}
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl ${subjectConfig.bgColor}`}>
                                              <IconComponent className={`h-6 w-6 ${subjectConfig.color}`} />
                                            </div>
                                            <h5 className="font-semibold text-slate-200 text-lg">{subject.subject}</h5>
                                          </div>
                                          <div
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${performanceLevel.bg} ${performanceLevel.color} border ${performanceLevel.border}`}
                                          >
                                            {performanceLevel.label}
                                          </div>
                                        </div>

                                        {/* Score Display */}
                                        <div className="text-center mb-4">
                                          <div className={`text-4xl font-bold mb-1 ${subjectConfig.color}`}>
                                            {subject.obtained || 0}/{subject.total || totalQuestions}
                                          </div>
                                          <div className="text-slate-400 text-sm">{accuracy.toFixed(0)}% Score</div>
                                        </div>

                                        {/* Accuracy Section */}
                                        <div className="mb-6">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-400 text-sm">Accuracy</span>
                                            <span className={`font-semibold ${getPerformanceColor(accuracy)}`}>
                                              {accuracy.toFixed(0)}%
                                            </span>
                                          </div>
                                          <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                                            <div
                                              className={`h-2 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${subjectConfig.gradientFrom} ${subjectConfig.gradientTo}`}
                                              style={{
                                                width: `${Math.min(accuracy, 100)}%`,
                                              }}
                                            ></div>
                                          </div>
                                        </div>

                                        {/* Question Breakdown */}
                                        <div className="grid grid-cols-3 gap-3 mb-6">
                                          <div className="text-center">
                                            <div className="flex items-center justify-center mb-2">
                                              <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                                              </div>
                                            </div>
                                            <div className="text-2xl font-bold text-emerald-400">{correct}</div>
                                            <div className="text-xs text-slate-400">Correct</div>
                                          </div>

                                          <div className="text-center">
                                            <div className="flex items-center justify-center mb-2">
                                              <div className="p-2 bg-red-500/20 rounded-lg">
                                                <XCircle className="h-4 w-4 text-red-400" />
                                              </div>
                                            </div>
                                            <div className="text-2xl font-bold text-red-400">{incorrect}</div>
                                            <div className="text-xs text-slate-400">Incorrect</div>
                                          </div>

                                          <div className="text-center">
                                            <div className="flex items-center justify-center mb-2">
                                              <div className="p-2 bg-amber-500/20 rounded-lg">
                                                <Minus className="h-4 w-4 text-amber-400" />
                                              </div>
                                            </div>
                                            <div className="text-2xl font-bold text-amber-400">{skipped}</div>
                                            <div className="text-xs text-slate-400">Skipped</div>
                                          </div>
                                        </div>

                                        {/* Time Analysis */}
                                        {/* <div className="bg-slate-800/40 rounded-lg p-4">
                                          <div className="flex items-center gap-2 mb-3">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-300">Time Analysis</span>
                                          </div>
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs text-slate-400">Time Spent</span>
                                              <span className="text-sm font-medium text-slate-300">
                                                {formatDuration(timeSpent)}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs text-slate-400">Avg per question</span>
                                              <span className="text-sm font-medium text-slate-300">
                                                {formatAvgTimePerQuestion(timeSpent, totalQuestions)}
                                              </span>
                                            </div>
                                          </div>
                                        </div> */}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


