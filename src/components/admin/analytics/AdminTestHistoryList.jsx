"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Timer,
  Award,
  Target,
  Clock,
  Zap,
  BarChart3,
  Trophy,
  Brain,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import Button from "@/components/ui/Button"
import AdminLeaderboardModal from "./AdminLeaderboardModal"

export default function AdminTestHistoryList({ testHistory, studentId, studentName }) {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState(null)
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [enrichedHistory, setEnrichedHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [selectedTestForLeaderboard, setSelectedTestForLeaderboard] = useState(null)

  // Fetch detailed data for each test attempt
  useEffect(() => {
    if (testHistory && testHistory.length > 0) {
      enrichTestHistoryData()
    }
  }, [testHistory, studentId])

  const enrichTestHistoryData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // Fetch detailed analytics for each attempt
      const enrichedData = await Promise.all(
        testHistory.map(async (attempt) => {
          try {
            // Fetch comprehensive analytics data for this specific attempt
            const response = await fetch(`/api/analytics/student/${attempt._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })

            if (response.ok) {
              const analyticsData = await response.json()
              console.log(`Analytics data for attempt ${attempt._id}:`, analyticsData)

              return {
                ...attempt,
                enrichedAnalytics: analyticsData.analytics,
                enrichedAttempt: analyticsData.attempt,
                enrichedTest: analyticsData.test,
              }
            } else {
              console.warn(`Failed to fetch analytics for attempt ${attempt._id}`)
              return attempt
            }
          } catch (error) {
            console.error(`Error fetching analytics for attempt ${attempt._id}:`, error)
            return attempt
          }
        }),
      )

      setEnrichedHistory(enrichedData)
    } catch (error) {
      console.error("Error enriching test history data:", error)
      setEnrichedHistory(testHistory)
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatTestTime = (attempt) => {
    if (attempt.timeSpent) {
      return formatDuration(attempt.timeSpent)
    }
    if (attempt.startTime && attempt.endTime) {
      const seconds = Math.floor((new Date(attempt.endTime) - new Date(attempt.startTime)) / 1000)
      return formatDuration(seconds)
    }
    return "N/A"
  }

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return "0s"
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)
    return parts.join(" ")
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
      case "submitted":
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

  const getSubjectColor = (subject) => {
    switch (subject.toLowerCase()) {
      case "physics":
        return {
          bg: "bg-blue-500/20",
          text: "text-blue-400",
          icon: "bg-blue-500",
          progressColor: "from-blue-500 to-cyan-500",
        }
      case "chemistry":
        return {
          bg: "bg-green-500/20",
          text: "text-green-400",
          icon: "bg-green-500",
          progressColor: "from-green-500 to-emerald-500",
        }
      case "mathematics":
        return {
          bg: "bg-purple-500/20",
          text: "text-purple-400",
          icon: "bg-purple-500",
          progressColor: "from-purple-500 to-pink-500",
        }
      default:
        return {
          bg: "bg-slate-500/20",
          text: "text-slate-400",
          icon: "bg-slate-500",
          progressColor: "from-slate-500 to-slate-600",
        }
    }
  }

  const getRecommendation = (correct, total) => {
    const percentage = total > 0 ? (correct / total) * 100 : 0
    if (percentage >= 80) return "🎉 Excellent work! Maintain this level."
    if (percentage >= 60) return "👍 Good work! Minor improvements needed."
    if (percentage >= 40) return "⚠️ Needs improvement. Focus on weak areas."
    return "⚠️ Requires significant improvement. Review fundamentals."
  }

  const getPerformanceLabel = (percentage) => {
    if (percentage >= 80) return "Excellent"
    if (percentage >= 60) return "Good"
    if (percentage >= 40) return "Average"
    return "Needs Improvement"
  }

  const handleCardClick = (testId, attemptId) => {
    const route = `/admin/analytics/students/${studentId}/analysis/${testId}`
    router.push(route)
  }

  const handleLeaderboardClick = (testId, testTitle) => {
    setSelectedTestForLeaderboard({
      id: testId,
      title: testTitle,
    })
    setShowLeaderboard(true)
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

  // Extract real data from enriched analytics
  const extractAttemptData = (attempt) => {
    console.log("🔍 EXTRACTING REAL ATTEMPT DATA:", attempt._id)

    // Use enriched analytics data if available
    const analytics = attempt.enrichedAnalytics
    const attemptData = attempt.enrichedAttempt || attempt
    const testData = attempt.enrichedTest || attempt.test

    console.log("Analytics data:", analytics)
    console.log("Attempt data:", attemptData)
    console.log("Test data:", testData)

    // Extract overall stats from actual data
    const overallStats = {
      correct: attemptData.analysis?.correct || 0,
      incorrect: attemptData.analysis?.incorrect || 0,
      unattempted: attemptData.analysis?.unattempted || 0,
      totalMarks: attemptData.score?.obtained || 0,
      percentage: attemptData.score?.percentage || 0,
    }

    // Extract subject-wise data from analytics
    const subjectScores = {}

    if (analytics?.subjectWise && Array.isArray(analytics.subjectWise)) {
      console.log("✅ Using enriched analytics subject-wise data")

      analytics.subjectWise.forEach((subject) => {
        subjectScores[subject.subject] = {
          correct: subject.correct || 0,
          incorrect: subject.incorrect || 0,
          unattempted: subject.unattempted || 0,
          total: subject.totalQuestions || 0,
          marks: subject.obtainedMarks || 0,
          totalMarks: subject.totalMarks || 0,
          percentage: subject.percentage || 0,
        }
      })
    } else if (attemptData.analysis?.subjectWise && Array.isArray(attemptData.analysis.subjectWise)) {
      console.log("✅ Using attempt analysis subject-wise data")

      attemptData.analysis.subjectWise.forEach((subject) => {
        subjectScores[subject.subject] = {
          correct: subject.correct || 0,
          incorrect: subject.incorrect || 0,
          unattempted: subject.unattempted || 0,
          total: (subject.correct || 0) + (subject.incorrect || 0) + (subject.unattempted || 0),
          marks: subject.score || (subject.correct || 0) * 4, // Assuming 4 marks per correct
          totalMarks: ((subject.correct || 0) + (subject.incorrect || 0) + (subject.unattempted || 0)) * 4,
          percentage: subject.percentage || 0,
        }
      })
    } else {
      console.log("⚠️ No subject-wise data available, using fallback")

      // Fallback: Initialize empty subject data
      const subjects = ["Physics", "Chemistry", "Mathematics"]
      subjects.forEach((subject) => {
        subjectScores[subject] = {
          correct: 0,
          incorrect: 0,
          unattempted: 0,
          total: 0,
          marks: 0,
          totalMarks: 0,
          percentage: 0,
        }
      })
    }

    console.log("📊 EXTRACTED REAL DATA:", { overallStats, subjectScores })
    return { overallStats, subjectScores }
  }

  if (!testHistory || testHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">No Test History</h3>
        <p className="text-slate-400">This student hasn't taken any tests yet.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-200">Attempt Timeline</h3>
            <p className="text-slate-400 text-sm">Loading detailed analytics...</p>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-4 gap-6 mb-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="text-center">
                      <div className="h-8 bg-slate-700 rounded w-full mb-2"></div>
                      <div className="h-4 bg-slate-700 rounded w-2/3 mx-auto"></div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="h-10 bg-slate-700 rounded flex-1"></div>
                  <div className="h-10 bg-slate-700 rounded flex-1"></div>
                  <div className="h-10 bg-slate-700 rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    )
  }

  const sortedHistory = [...enrichedHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-200">Attempt Timeline</h3>
          {/* <p className="text-slate-400 text-sm">
            {studentName}'s test attempts ({testHistory.length} total)
          </p> */}
        </div>
      </div>

      <div className="space-y-6">
        {sortedHistory.map((attempt, index) => {
          if (!attempt || !attempt.test) {
            return (
              <div key={attempt?._id || index} className="bg-red-900/20 p-4 rounded-lg mb-4">
                <span className="text-red-400">⚠️ Corrupted test attempt data</span>
              </div>
            )
          }

          const testId = attempt.test?._id || attempt.testId
          const attemptId = attempt._id
          const statusConfig = getStatusConfig(attempt.status)
          const isExpanded = expandedCards.has(attemptId)

          // Extract data using real database data
          const { overallStats, subjectScores } = extractAttemptData(attempt)
          const timeSpent = formatTestTime(attempt)
          const attemptNumber = sortedHistory.length - index

          return (
            <div key={attemptId} className="relative">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between m-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        #{attemptNumber}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-3">
                          Attempt {attemptNumber}
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}
                          >
                            {statusConfig.icon}
                            <span>{statusConfig.label}</span>
                          </div>
                        </h3>
                        <p className="text-slate-400 text-sm">{attempt.test?.title || "Unknown Test"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{formatDateTime(attempt.createdAt)}</span>
                    </div>
                  </div>

                  {/* Debug Info */}
                  {/* {process.env.NODE_ENV === "development" && (
                    <div className="mb-4 p-3 bg-slate-900/50 rounded-lg text-xs text-slate-400">
                      <div className="font-mono">
                        DEBUG: Correct={overallStats.correct}, Score={overallStats.totalMarks}, Physics=
                        {subjectScores.Physics?.marks || 0}, Chemistry={subjectScores.Chemistry?.marks || 0}, Math=
                        {subjectScores.Mathematics?.marks || 0}
                      </div>
                    </div>
                  )} */}

                  {/* Metrics Row - Using Real Data */}
                  <div className="grid grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Award className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-200">{overallStats.totalMarks}</div>
                      <div className="text-sm text-slate-400">Score</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className={`text-2xl font-bold ${getPerformanceColor(overallStats.percentage)}`}>
                        {overallStats.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-400">Percentage</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="text-2xl font-bold text-teal-400">{timeSpent}</div>
                      <div className="text-sm text-slate-400">Time</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Zap className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="text-2xl font-bold text-purple-400">{overallStats.correct}</div>
                      <div className="text-sm text-slate-400">Correct</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-4">
                    <Button
                      onClick={() => handleCardClick(testId, attemptId)}
                      className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>

                    <Button
                      onClick={() => handleLeaderboardClick(testId, attempt.test?.title)}
                      variant="outline"
                      className="flex-1 border-slate-600 hover:border-teal-500 hover:bg-teal-500/10"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      View Leaderboard
                    </Button>

                    <Button
                      onClick={() => toggleCardExpansion(attemptId)}
                      variant="outline"
                      className="border-slate-600 hover:border-blue-500 hover:bg-blue-500/10"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Subject Details
                      {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                    </Button>
                  </div>

                  {/* Expanded Subject Analysis */}
                  {isExpanded && (
                    <div className="border-t border-slate-700/50 pt-6">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-5 w-5 text-teal-400" />
                          <h4 className="text-lg font-semibold text-slate-200">Subject Analysis</h4>
                        </div>
                        <p className="text-slate-400 text-sm">
                          Detailed breakdown of performance across different subjects
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(subjectScores)
                          .filter(([subject, scores]) => scores.total > 0 || scores.marks > 0) // Only show subjects with data
                          .map(([subject, scores]) => {
                            const colors = getSubjectColor(subject)
                            const recommendation = getRecommendation(scores.correct, scores.total)
                            const performanceLabel = getPerformanceLabel(scores.percentage)
                            const needsImprovement = scores.percentage < 60

                            return (
                              <Card key={subject} className="bg-slate-800/30 border-slate-700/50">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                                      <BookOpen className={`h-5 w-5 ${colors.text}`} />
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-slate-200">{subject}</h5>
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          needsImprovement
                                            ? "text-red-400 bg-red-500/10"
                                            : "text-emerald-400 bg-emerald-500/10"
                                        }`}
                                      >
                                        {performanceLabel}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-center mb-4">
                                    <div className={`text-4xl font-bold mb-2 ${colors.text}`}>
                                      {scores.marks}/{scores.totalMarks}
                                    </div>
                                    <div className="text-sm text-slate-400 mb-2">
                                      {scores.percentage.toFixed(scores.percentage % 1 === 0 ? 0 : 2)}% Score
                                    </div>
                                  </div>

                                  {/* Accuracy Progress Bar */}
                                  <div className="mb-4">
                                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                                      <span>Accuracy</span>
                                      <span>{scores.percentage.toFixed(scores.percentage % 1 === 0 ? 0 : 2)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full bg-gradient-to-r ${colors.progressColor}`}
                                        style={{ width: `${Math.min(scores.percentage, 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                    <div className="flex flex-col items-center">
                                      <CheckCircle className="h-5 w-5 text-green-400 mb-1" />
                                      <div className="text-green-400 font-bold text-lg">{scores.correct}</div>
                                      <div className="text-xs text-slate-400">Correct</div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <XCircle className="h-5 w-5 text-red-400 mb-1" />
                                      <div className="text-red-400 font-bold text-lg">{scores.incorrect}</div>
                                      <div className="text-xs text-slate-400">Incorrect</div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <Timer className="h-5 w-5 text-yellow-400 mb-1" />
                                      <div className="text-yellow-400 font-bold text-lg">{scores.unattempted}</div>
                                      <div className="text-xs text-slate-400">Skipped</div>
                                    </div>
                                  </div>

                                  {/* Recommendation */}
                                  <div className="bg-slate-700/30 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <div className="text-xs font-medium text-slate-300 mb-1">RECOMMENDATION</div>
                                        <div className="text-xs text-slate-400">{recommendation}</div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                      </div>

                      {/* Show message if no subject data available */}
                      {Object.entries(subjectScores).filter(([subject, scores]) => scores.total > 0 || scores.marks > 0)
                        .length === 0 && (
                        <div className="text-center py-8">
                          <div className="text-slate-400 mb-2">No subject-wise data available</div>
                          <div className="text-slate-500 text-sm">
                            Subject analysis will be available once the test attempt data is processed
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Admin Leaderboard Modal */}
      {showLeaderboard && selectedTestForLeaderboard && (
        <AdminLeaderboardModal
          testId={selectedTestForLeaderboard.id}
          testTitle={selectedTestForLeaderboard.title}
          isOpen={showLeaderboard}
          onClose={() => {
            setShowLeaderboard(false)
            setSelectedTestForLeaderboard(null)
          }}
          highlightUserId={studentId}
          studentName={studentName}
        />
      )}
    </div>
  )
}
