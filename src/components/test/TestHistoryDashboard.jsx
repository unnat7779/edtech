"use client"

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
  Trophy,
  Medal,
} from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import SubjectAnalysis from "@/components/analytics/student/SubjectAnalysis"
import ProgressModal from "@/components/analytics/student/ProgressModal"
import LeaderboardModal from "@/components/analytics/student/LeaderboardModal"

export default function TestHistoryDashboard({
  testId,
  onClose,
  isAdminView = false,
  studentId = null,
  studentName = null,
}) {
  const router = useRouter()
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false)

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

      // Use different endpoint for admin view
      const endpoint =
        isAdminView && studentId
          ? `/api/admin/analytics/students/${studentId}/test-history/${testId}`
          : `/api/test-history/${testId}`

      const response = await fetch(endpoint, {
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

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-400" />
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />
      default:
        return <span className="text-slate-400 font-bold text-sm">#{rank}</span>
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

    console.log("🔄 Creating analytics data for attempt:", attempt._id)
    console.log("📊 Attempt timing data:", {
      timeSpent: attempt.timeSpent,
      questionTimeTracking: attempt.questionTimeTracking?.length || 0,
      subjectTimeTracking: attempt.subjectTimeTracking?.length || 0,
      subjectWiseScores: attempt.subjectWiseScores?.length || 0,
    })

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
        totalTime: attempt.timeSpent || 0,
        timeDistribution: attempt.subjectWiseScores.map((subject) => ({
          subject: subject.subject,
          time: subject.timeSpent || 0,
          timeInSeconds: subject.timeSpent || 0,
          percentage: attempt.timeSpent > 0 ? Math.round(((subject.timeSpent || 0) / attempt.timeSpent) * 100) : 0,
          questions: (subject.correct || 0) + (subject.incorrect || 0) + (subject.unattempted || 0),
        })),
        questionTimeDetails: [], // Will be populated below
        averageTimePerQuestion: 0, // Will be calculated
        timePerCorrectAnswer: 0,
        timePerIncorrectAnswer: 0,
        averageTimePerSubject: {},
        totalQuestionsWithTime: 0,
      },
    }

    // Create proper attempt data with ACTUAL timing data from the test history
    const mockAttemptData = {
      _id: attempt._id,
      timeSpent: attempt.timeSpent || 0,
      // Use the ACTUAL time tracking data from the test history
      questionTimeTracking: attempt.questionTimeTracking || [],
      subjectTimeTracking: attempt.subjectTimeTracking || [],
      answers: attempt.answers || [],
      // Add the analysis data for consistency
      analysis: attempt.analysis || {},
    }

    // Create test data structure - try to reconstruct from available data
    const mockTestData = {
      questions: [], // Will be populated if available
      duration: attempt.test?.duration || 180,
      title: attempt.test?.title || "Test",
    }

    // If we have question time tracking, create question details for time analysis
    if (attempt.questionTimeTracking && attempt.questionTimeTracking.length > 0) {
      console.log("📝 Processing question time tracking data...")

      const questionTimeDetails = []
      let totalTimeFromQuestions = 0

      attempt.questionTimeTracking.forEach((qt, index) => {
        const timeSpent = qt.timeSpent || qt.totalTime || 0
        totalTimeFromQuestions += timeSpent

        // Try to determine subject from the question data or use a mapping
        let subject = "Mathematics" // default
        if (qt.subject) {
          subject = qt.subject
        } else {
          // Try to map from subject-wise scores based on question index
          const questionIndex = qt.questionIndex || index
          // This is a rough mapping - in a real scenario, you'd have the actual question data
          if (questionIndex < 20) subject = "Physics"
          else if (questionIndex < 40) subject = "Chemistry"
          else subject = "Mathematics"
        }

        questionTimeDetails.push({
          questionIndex: qt.questionIndex || index,
          questionNo: (qt.questionIndex || index) + 1,
          subject: subject,
          timeSpent: timeSpent,
          isAnswered: qt.isAnswered || false,
          isCorrect: qt.isCorrect || false,
          isMarked: qt.isMarked || false,
          wasVisited: timeSpent > 0 || qt.isAnswered || qt.isMarked,
        })

        // Add to mock test data
        mockTestData.questions.push({
          _id: `q_${index}`,
          subject: subject,
          questionText: `Question ${index + 1}`,
        })
      })

      analyticsData.timeAnalytics.questionTimeDetails = questionTimeDetails
      analyticsData.timeAnalytics.totalQuestionsWithTime = questionTimeDetails.filter((q) => q.timeSpent > 0).length

      // Calculate averages
      const totalQuestions = questionTimeDetails.length
      if (totalQuestions > 0) {
        analyticsData.timeAnalytics.averageTimePerQuestion = Math.round(totalTimeFromQuestions / totalQuestions)
      }

      // Calculate time per correct/incorrect answers
      const correctAnswers = questionTimeDetails.filter((q) => q.isAnswered && q.isCorrect)
      const incorrectAnswers = questionTimeDetails.filter((q) => q.isAnswered && !q.isCorrect)

      if (correctAnswers.length > 0) {
        analyticsData.timeAnalytics.timePerCorrectAnswer = Math.round(
          correctAnswers.reduce((sum, q) => sum + q.timeSpent, 0) / correctAnswers.length,
        )
      }

      if (incorrectAnswers.length > 0) {
        analyticsData.timeAnalytics.timePerIncorrectAnswer = Math.round(
          incorrectAnswers.reduce((sum, q) => sum + q.timeSpent, 0) / incorrectAnswers.length,
        )
      }

      // Calculate average time per subject
      analyticsData.timeAnalytics.averageTimePerSubject = {}
      analyticsData.timeAnalytics.timeDistribution.forEach((subject) => {
        const subjectQuestions = questionTimeDetails.filter((q) => q.subject === subject.subject)
        if (subjectQuestions.length > 0) {
          analyticsData.timeAnalytics.averageTimePerSubject[subject.subject] = Math.round(
            subject.time / subjectQuestions.length,
          )
        }
      })

      console.log("✅ Processed timing data:", {
        totalTimeFromQuestions,
        questionTimeDetails: questionTimeDetails.length,
        averageTimePerQuestion: analyticsData.timeAnalytics.averageTimePerQuestion,
        timeDistribution: analyticsData.timeAnalytics.timeDistribution,
      })
    }

    console.log("🎯 Final analytics data structure:", {
      subjectWise: analyticsData.subjectWise.length,
      timeAnalytics: {
        totalTime: analyticsData.timeAnalytics.totalTime,
        timeDistribution: analyticsData.timeAnalytics.timeDistribution.length,
        questionTimeDetails: analyticsData.timeAnalytics.questionTimeDetails.length,
      },
      mockAttemptData: {
        timeSpent: mockAttemptData.timeSpent,
        questionTimeTracking: mockAttemptData.questionTimeTracking.length,
        subjectTimeTracking: mockAttemptData.subjectTimeTracking.length,
      },
    })

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
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 border border-slate-700/50">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-200 text-sm sm:text-base">Loading test history...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-700/50">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Error Loading History</h3>
            <p className="text-slate-400 mb-4 text-sm sm:text-base">{error}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={fetchTestHistory} className="flex-1">
                Retry
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
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
      <div className="min-h-screen p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile-Optimized Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button onClick={onClose} variant="outline" className="p-2 shrink-0 hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-200 truncate">
                  {isAdminView ? `${studentName}'s Test History` : "Test History"}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm lg:text-base truncate">
                  {history[0]?.test?.title || "Test"} • {stats?.totalAttempts || 0} attempts
                  {isAdminView && <span className="ml-2">• Admin View</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile-Optimized Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg shrink-0">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Best Score</p>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-slate-200 truncate">
                        {stats.bestScore || 0}/{history[0]?.test?.totalMarks || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg shrink-0">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Best %</p>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-slate-200">
                        {(stats.bestPercentage || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg shrink-0">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Average</p>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-slate-200">
                        {(stats.averagePercentage || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-teal-500/20 rounded-lg shrink-0">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Total Time</p>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-slate-200">
                        {formatDuration(stats.totalTimeSpent || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mobile-Optimized Filters and Sorting */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-300 shrink-0">Filter:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 min-w-0 flex-1 sm:flex-none focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 min-w-0 flex-1 sm:flex-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="date">Date</option>
                    <option value="score">Score</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500"
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

          {/* Progress Modal Component */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-200 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="text-center">
                <p className="text-slate-400 mb-4 text-sm sm:text-base">
                  View detailed analytics and leaderboard for this test
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setShowProgressModal(true)}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Progress Analytics
                  </Button>
                  <Button
                    onClick={() => setShowLeaderboardModal(true)}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    View Leaderboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-Optimized Timeline */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-200 text-base sm:text-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Attempt Timeline ({sortedAndFilteredHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              {sortedAndFilteredHistory.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-slate-300 mb-2">No attempts found</h3>
                  <p className="text-slate-400 text-sm">
                    {filterStatus !== "all"
                      ? "Try changing the filter to see more attempts."
                      : "Take this test to see your history here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {sortedAndFilteredHistory.map((attempt, index) => {
                    const statusConfig = getStatusConfig(attempt.completionStatus)
                    const isExpanded = expandedCards.has(attempt._id)
                    const analyticsData = createAnalyticsDataForAttempt(attempt)

                    return (
                      <div key={attempt._id} className="relative">
                        {/* Timeline Line */}
                        {index < sortedAndFilteredHistory.length - 1 && (
                          <div className="absolute left-5 sm:left-6 lg:left-8 top-16 sm:top-20 lg:top-24 w-0.5 h-12 sm:h-16 lg:h-20 bg-gradient-to-b from-teal-500/50 to-transparent"></div>
                        )}

                        {/* Mobile-Optimized Main Card */}
                        <div
                          className={`relative bg-slate-800/30 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl border transition-all duration-300 hover:bg-slate-800/50 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 ${statusConfig.borderColor}`}
                        >
                          {/* Card Header */}
                          <div className="p-3 sm:p-4 lg:p-6">
                            <div className="flex items-start gap-3 sm:gap-4">
                              {/* Attempt Number Badge */}
                              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-xs sm:text-sm lg:text-lg font-bold text-white">
                                  #{attempt.attemptNumber}
                                </span>
                              </div>

                              {/* Header Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-2 mb-3">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-200 truncate">
                                      Attempt {attempt.attemptNumber}
                                    </h3>
                                    <div
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}
                                    >
                                      {statusConfig.icon}
                                      <span className="hidden sm:inline">{statusConfig.label}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                                    <div>
                                      <span className="font-medium">{formatDate(attempt.startTime)}</span>
                                      <span className="ml-2">{formatTimeOfDay(attempt.startTime)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Mobile-Optimized Performance Metrics */}
                                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3 text-center">
                                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                                      <Award className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                                    </div>
                                    <div className="text-sm sm:text-lg lg:text-xl font-bold text-emerald-400">
                                      {attempt.score.obtained}
                                    </div>
                                    <div className="text-xs text-slate-400">Score</div>
                                  </div>

                                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3 text-center">
                                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                                      <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                    </div>
                                    <div
                                      className={`text-sm sm:text-lg lg:text-xl font-bold ${getPerformanceColor(
                                        attempt.score.percentage,
                                      )}`}
                                    >
                                      {attempt.score.percentage.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-slate-400">Percentage</div>
                                  </div>

                                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3 text-center">
                                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400" />
                                    </div>
                                    <div className="text-sm sm:text-lg lg:text-xl font-bold text-teal-400">
                                      {formatTime(attempt.timeSpent)}
                                    </div>
                                    <div className="text-xs text-slate-400">Time</div>
                                  </div>

                                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3 text-center">
                                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                                    </div>
                                    <div className="text-sm sm:text-lg lg:text-xl font-bold text-purple-400">
                                      {attempt.analysis?.correct || 0}
                                    </div>
                                    <div className="text-xs text-slate-400">Correct</div>
                                  </div>
                                </div>

                                {/* Improvement Indicator */}
                                {index > 0 && attempt.improvement && (
                                  <div className="bg-slate-700/20 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                                    <div className="flex items-center gap-2">
                                      {getTrendIcon(attempt.improvement.scoreChange)}
                                      <span className="text-xs sm:text-sm text-slate-300">
                                        {attempt.improvement.scoreChange > 0 ? "+" : ""}
                                        {attempt.improvement.scoreChange.toFixed(1)}% from previous attempt
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Mobile-Optimized Action Buttons */}
                                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                  <Button
                                    onClick={() => handleAttemptClick(attempt._id)}
                                    className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg text-sm sm:text-base"
                                  >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    View Analytics
                                  </Button>

                                  <Button
                                    onClick={() => toggleCardExpansion(attempt._id)}
                                    variant="outline"
                                    className="sm:w-auto border-slate-600 hover:border-blue-500 hover:bg-blue-500/10 text-sm sm:text-base"
                                  >
                                    <Brain className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Subject Details</span>
                                    <span className="sm:hidden">Details</span>
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4 ml-2" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 ml-2" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Subject Details Content */}
                          {isExpanded && analyticsData && (
                            <div className="border-t border-slate-700/50 bg-slate-800/20">
                              <div className="p-3 sm:p-4 lg:p-6">
                                <div className="mb-4">
                                  <h4 className="text-base sm:text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
                                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                                    Subject-wise Analysis
                                  </h4>
                                  <p className="text-xs sm:text-sm text-slate-400">
                                    Detailed breakdown of performance across subjects
                                  </p>
                                </div>
                                <SubjectAnalysis
                                  analyticsData={analyticsData.analyticsData}
                                  attemptData={analyticsData.attemptData}
                                  testData={analyticsData.testData}
                                />
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

      {/* Progress Modal */}
      {showProgressModal && (
        <ProgressModal testId={testId} isOpen={showProgressModal} onClose={() => setShowProgressModal(false)} />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <LeaderboardModal
          testId={testId}
          testTitle={history[0]?.test?.title || "Test"}
          isOpen={showLeaderboardModal}
          onClose={() => setShowLeaderboardModal(false)}
        />
      )}
    </div>
  )
}
