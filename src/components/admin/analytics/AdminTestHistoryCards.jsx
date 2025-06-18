"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import {
  Calendar,
  Clock,
  Award,
  Target,
  BookOpen,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  Timer,
  Eye,
  Activity,
  Brain,
} from "lucide-react"

export default function AdminTestHistoryCards({ testHistory, studentId, studentName }) {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState(null)

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

  const getPerformanceGradient = (percentage) => {
    if (percentage >= 80) return "from-emerald-500/20 to-green-500/20"
    if (percentage >= 60) return "from-blue-500/20 to-cyan-500/20"
    if (percentage >= 40) return "from-amber-500/20 to-yellow-500/20"
    return "from-red-500/20 to-pink-500/20"
  }

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-emerald-400" />
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-400" />
    return <Minus className="h-3 w-3 text-slate-400" />
  }

  const handleCardClick = (testId) => {
    router.push(`/admin/analytics/students/${studentId}/analysis/${testId}`)
  }

  const handleViewAnalytics = (e, attemptId) => {
    e.stopPropagation()
    router.push(`/analytics/student/${attemptId}`)
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

  // Group test history by test
  const groupedHistory = testHistory.reduce((acc, attempt) => {
    const testId = attempt.test?._id || attempt.testId
    if (!acc[testId]) {
      acc[testId] = {
        test: attempt.test,
        attempts: [],
        bestScore: 0,
        totalAttempts: 0,
        averageScore: 0,
        lastAttempt: null,
      }
    }

    acc[testId].attempts.push(attempt)
    acc[testId].totalAttempts++

    const score = attempt.score?.percentage || 0
    if (score > acc[testId].bestScore) {
      acc[testId].bestScore = score
    }

    if (!acc[testId].lastAttempt || new Date(attempt.createdAt) > new Date(acc[testId].lastAttempt.createdAt)) {
      acc[testId].lastAttempt = attempt
    }

    return acc
  }, {})

  // Calculate average scores
  Object.keys(groupedHistory).forEach((testId) => {
    const group = groupedHistory[testId]
    const totalScore = group.attempts.reduce((sum, attempt) => sum + (attempt.score?.percentage || 0), 0)
    group.averageScore = totalScore / group.attempts.length
  })

  const testGroups = Object.values(groupedHistory).sort(
    (a, b) => new Date(b.lastAttempt.createdAt) - new Date(a.lastAttempt.createdAt),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-200">Test History</h3>
          <p className="text-slate-400 text-sm">
            {studentName}'s performance across {testGroups.length} tests
          </p>
        </div>
        <div className="text-sm text-slate-400">Total Attempts: {testHistory.length}</div>
      </div>

      <div className="grid gap-4">
        {testGroups.map((group) => {
          const { test, attempts, bestScore, totalAttempts, averageScore, lastAttempt } = group
          const testId = test?._id || lastAttempt.testId
          const statusConfig = getStatusConfig(lastAttempt.completionStatus)
          const isHovered = hoveredCard === testId

          return (
            <Card
              key={testId}
              className={`
                relative overflow-hidden cursor-pointer transition-all duration-300 transform
                bg-gradient-to-br ${getPerformanceGradient(bestScore)} backdrop-blur-sm
                border border-slate-700/50 hover:border-teal-500/50
                hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1
                ${isHovered ? "scale-[1.02]" : "hover:scale-[1.01]"}
              `}
              onClick={() => handleCardClick(testId)}
              onMouseEnter={() => setHoveredCard(testId)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <CardContent className="p-6 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Test Info Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-slate-200 mb-2 truncate">
                          {test?.title || "Unknown Test"}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>Last: {formatDate(lastAttempt.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimeOfDay(lastAttempt.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Activity className="h-4 w-4" />
                            <span>
                              {totalAttempts} attempt{totalAttempts !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                        ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}
                      `}
                      >
                        {statusConfig.icon}
                        <span className="hidden sm:inline">{statusConfig.label}</span>
                      </div>
                    </div>

                    {/* Performance Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-3 text-center border border-slate-700/30">
                        <div className="flex items-center justify-center mb-2">
                          <Award className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div className={`text-lg font-bold ${getPerformanceColor(bestScore)}`}>
                          {bestScore.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">Best Score</div>
                      </div>

                      <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-3 text-center border border-slate-700/30">
                        <div className="flex items-center justify-center mb-2">
                          <Target className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className={`text-lg font-bold ${getPerformanceColor(averageScore)}`}>
                          {averageScore.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">Average</div>
                      </div>

                      <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-3 text-center border border-slate-700/30">
                        <div className="flex items-center justify-center mb-2">
                          <Clock className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="text-lg font-bold text-purple-400">{formatDuration(lastAttempt.timeSpent)}</div>
                        <div className="text-xs text-slate-400">Last Time</div>
                      </div>

                      <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-3 text-center border border-slate-700/30">
                        <div className="flex items-center justify-center mb-2">
                          <Brain className="h-4 w-4 text-teal-400" />
                        </div>
                        <div className="text-lg font-bold text-teal-400">{lastAttempt.analysis?.correct || 0}</div>
                        <div className="text-xs text-slate-400">Correct</div>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    {totalAttempts > 1 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-400">Progress Trend</span>
                          <div className="flex items-center gap-1">
                            {attempts.length > 1 &&
                              getTrendIcon(
                                attempts[attempts.length - 1].score?.percentage -
                                  attempts[attempts.length - 2].score?.percentage,
                              )}
                            <span className="text-slate-300">
                              {attempts.length > 1
                                ? `${(attempts[attempts.length - 1].score?.percentage - attempts[attempts.length - 2].score?.percentage).toFixed(1)}%`
                                : "First attempt"}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${
                              bestScore >= 80
                                ? "from-emerald-500 to-green-400"
                                : bestScore >= 60
                                  ? "from-blue-500 to-cyan-400"
                                  : bestScore >= 40
                                    ? "from-amber-500 to-yellow-400"
                                    : "from-red-500 to-pink-400"
                            }`}
                            style={{ width: `${Math.min(bestScore, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
                    <Button
                      className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCardClick(testId)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Test History
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 border-slate-600 hover:border-teal-500 hover:bg-teal-500/10 text-slate-300 hover:text-teal-300"
                      onClick={(e) => handleViewAnalytics(e, lastAttempt._id)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div
                  className={`
                  absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 
                  transition-opacity duration-300 pointer-events-none
                  ${isHovered ? "opacity-100" : "opacity-0"}
                `}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
