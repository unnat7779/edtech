"use client"

import { useState, useEffect } from "react"
import { Trophy, Target, Clock, Users, Award, Medal, ArrowUp } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function PerformanceOverview({ attemptData, testData, analyticsData }) {
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch real leaderboard data on component mount
  useEffect(() => {
    fetchLeaderboardData()
  }, [testData._id, attemptData._id])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${testData._id}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()

        // Process to show unique students with their latest scores only
        const uniqueStudents = new Map()

        data.leaderboard?.forEach((attempt) => {
          const studentId = attempt.student._id
          const existingAttempt = uniqueStudents.get(studentId)

          if (!existingAttempt || new Date(attempt.createdAt) > new Date(existingAttempt.createdAt)) {
            uniqueStudents.set(studentId, attempt)
          }
        })

        // Convert to array and sort by score
        const sortedRanking = Array.from(uniqueStudents.values()).sort(
          (a, b) => (b.score?.obtained || 0) - (a.score?.obtained || 0),
        )

        // Find current user's position and calculate percentile
        const currentUserAttempt = sortedRanking.find(
          (attempt) =>
            attempt._id === attemptData._id || attempt.student._id === (attemptData.student._id || attemptData.student),
        )

        let userRank = null
        let userPercentile = 0

        if (currentUserAttempt) {
          userRank = sortedRanking.findIndex((attempt) => attempt._id === currentUserAttempt._id) + 1
          const totalStudents = sortedRanking.length
          const currentUserScore = currentUserAttempt.score?.obtained || 0

          // Calculate percentile using the new formula:
          // percentile = (number_of_students_with_score_less_than_or_equal / total_students) * 100
          const studentsWithLowerOrEqualScore = sortedRanking.filter(
            (attempt) => (attempt.score?.obtained || 0) <= currentUserScore,
          ).length

          userPercentile = totalStudents > 0 ? Math.round((studentsWithLowerOrEqualScore / totalStudents) * 100) : 0
        }

        setLeaderboardData({
          userRank,
          userPercentile,
          totalStudents: sortedRanking.length,
          leaderboard: sortedRanking,
        })
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
      // Fallback to analyticsData if leaderboard fetch fails
      setLeaderboardData({
        userRank: analyticsData.rank,
        userPercentile: analyticsData.percentile,
        totalStudents: analyticsData.totalStudents,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!attemptData || !testData || !analyticsData) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-80 bg-slate-700 rounded-3xl"></div>
            <div className="space-y-4">
              <div className="h-36 bg-slate-700 rounded-3xl"></div>
              <div className="h-36 bg-slate-700 rounded-3xl"></div>
            </div>
            <div className="h-80 bg-slate-700 rounded-3xl"></div>
          </div>
        </div>
      </div>
    )
  }

  const score = attemptData.score || {}
  const analysis = attemptData.analysis || {}
  const scorePercentage = Math.round(score.percentage || 0)
  const correctAnswers = analysis.correct || 0
  const incorrectAnswers = analysis.incorrect || 0
  const unattemptedAnswers = (analyticsData.totalQuestions || 0) - correctAnswers - incorrectAnswers

  // Use leaderboard data if available, otherwise fallback to analyticsData
  const currentRank = leaderboardData?.userRank || analyticsData.rank || 1
  const currentPercentile = leaderboardData?.userPercentile || analyticsData.percentile || 0
  const totalStudents = leaderboardData?.totalStudents || analyticsData.totalStudents || 1

  // Calculate accuracy
  const totalAttempted = correctAnswers + incorrectAnswers
  const accuracy = totalAttempted > 0 ? Math.round((correctAnswers / totalAttempted) * 100) : 0

  // Subject-wise data - properly handle the data structure
  const subjectData = analyticsData.subjectWise || []
  console.log("Subject data in PerformanceOverview:", subjectData)

  // Format time helper
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  // Circular Progress Component
  const CircularProgress = ({ percentage, size = 200, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgb(71, 85, 105)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-white">
            {score.obtained || 0}
            <span className="text-2xl text-slate-400">/{score.total || 0}</span>
          </div>
          <div className="text-2xl font-bold text-teal-400 mt-1">{scorePercentage}%</div>
        </div>
      </div>
    )
  }

  // Interactive Donut Chart Component
  const InteractiveDonutChart = ({ data, size = 200, strokeWidth = 20 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const total = data.reduce((sum, d) => sum + d.value, 0)

    if (total === 0) {
      return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <div className="text-slate-400 text-center">
            <div className="text-lg font-medium">No Data</div>
            <div className="text-sm">Available</div>
          </div>
        </div>
      )
    }

    let cumulativePercentage = 0
    const segments = data.map((item, index) => {
      const percentage = (item.value / total) * 100
      const strokeDasharray = circumference
      const strokeDashoffset = circumference - (percentage / 100) * circumference
      const rotation = (cumulativePercentage / 100) * 360
      cumulativePercentage += percentage

      return {
        ...item,
        index,
        percentage,
        strokeDasharray,
        strokeDashoffset,
        rotation,
      }
    })

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={hoveredSegment === segment.index ? segment.hoverColor || segment.color : segment.color}
              strokeWidth={hoveredSegment === segment.index ? strokeWidth + 2 : strokeWidth}
              fill="none"
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              strokeLinecap="round"
              style={{
                transform: `rotate(${segment.rotation}deg)`,
                transformOrigin: `${size / 2}px ${size / 2}px`,
                cursor: "pointer",
              }}
              className="transition-all duration-300 ease-out"
              onMouseEnter={() => setHoveredSegment(segment.index)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          ))}
        </svg>

        {/* Hover tooltip */}
        {hoveredSegment !== null && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg border border-slate-600 z-10">
            <div className="text-center">
              <div className="text-sm font-medium">{segments[hoveredSegment]?.label}</div>
              <div className="text-lg font-bold">{segments[hoveredSegment]?.value}</div>
              <div className="text-xs text-slate-300">{segments[hoveredSegment]?.percentage.toFixed(1)}%</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Updated question analysis data with hover colors
  const questionAnalysisData = [
    {
      label: "Correct",
      value: correctAnswers,
      color: "#10b981",
      hoverColor: "#059669",
    },
    {
      label: "Incorrect",
      value: incorrectAnswers,
      color: "#ef4444",
      hoverColor: "#dc2626",
    },
    {
      label: "Unattempted",
      value: unattemptedAnswers,
      color: "#eab308",
      hoverColor: "#ca8a04",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
          Performance Overview
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Comprehensive analysis of your test performance with detailed insights and metrics
        </p>
      </div>

      {/* Main Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Score - Circular Progress */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8">
          <CardContent className="flex flex-col items-center space-y-6">
            <CircularProgress percentage={scorePercentage} />
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-semibold text-slate-200">Overall Score</span>
            </div>
          </CardContent>
        </Card>

        {/* Rank and Percentile Cards */}
        <div className="space-y-6">
          {/* Your Rank */}
          <Card className="bg-gradient-to-br from-teal-800/40 to-cyan-800/40 backdrop-blur-xl border border-teal-700/50 p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Medal className="h-6 w-6 text-yellow-400" />
                <span className="text-slate-300 font-medium">Your Rank</span>
              </div>
              <div className="text-4xl font-bold text-yellow-400">{loading ? "..." : `#${currentRank}`}</div>
              <div className="text-slate-400">{loading ? "Loading..." : `out of ${totalStudents} students`}</div>
            </CardContent>
          </Card>

          {/* Percentile */}
          <Card className="bg-gradient-to-br from-purple-800/40 to-violet-800/40 backdrop-blur-xl border border-purple-700/50 p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-purple-400" />
                <span className="text-slate-300 font-medium">Percentile</span>
              </div>
              <div className="text-4xl font-bold text-purple-400">{loading ? "..." : `${currentPercentile}th`}</div>
              <div className="text-slate-400">
                {loading ? "Calculating..." : `At or above ${currentPercentile}% of students`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Analysis - Interactive Donut Chart */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8">
          <CardContent className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-200">Question Analysis</h3>
            <div className="flex flex-col items-center space-y-6">
              <InteractiveDonutChart data={questionAnalysisData} />
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-400 text-sm">Correct</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-200">{correctAnswers}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-slate-400 text-sm">Incorrect</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-200">{incorrectAnswers}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2  mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-slate-400 ml-6 text-sm">Unattempted</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-200">{unattemptedAnswers}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Performance */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader className="pb-6">
          <CardTitle className="text-slate-200 flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            Subject-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subjectData && subjectData.length > 0
              ? subjectData.map((subject, index) => {
                  console.log("Rendering subject:", subject)
                  const accuracy = subject.accuracy || 0
                  const obtainedMarks = subject.obtainedMarks || 0
                  const totalMarks = subject.totalMarks || 0
                  const isGoodPerformance = accuracy >= 60

                  return (
                    <div key={index} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-slate-200">{subject.subject}</h4>
                        <span className="text-slate-400 font-medium">
                          {obtainedMarks}/{totalMarks}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${accuracy}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium">{accuracy}%</span>
                          <span className={`text-sm ${isGoodPerformance ? "text-green-400" : "text-red-400"}`}>
                            {isGoodPerformance ? "Good Work" : "Needs Work"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              : // Fallback when no subject data is available
                ["Physics", "Chemistry", "Mathematics"].map((subject, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-slate-200">{subject}</h4>
                      <span className="text-slate-500 font-medium">0/0</span>
                    </div>
                    <div className="space-y-3">
                      <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-600 to-slate-500 h-3 rounded-full w-0 transition-all duration-1000 ease-out"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">No Data</span>
                        <span className="text-slate-500 text-sm">Not Attempted</span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Correct Answers */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-green-500/20">
                <ArrowUp className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400">{correctAnswers}</div>
            <div className="text-slate-400 font-medium">Correct Answers</div>
          </CardContent>
        </Card>

        {/* Incorrect Answers */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-red-500/20">
                <Target className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-red-400">{incorrectAnswers}</div>
            <div className="text-slate-400 font-medium">Incorrect Answers</div>
          </CardContent>
        </Card>

        {/* Time Spent */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{formatTime(attemptData.timeSpent || 0)}</div>
            <div className="text-slate-400 font-medium">Time Spent</div>
          </CardContent>
        </Card>

        {/* Accuracy */}
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-purple-500/20">
                <Award className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-400">{accuracy}.0%</div>
            <div className="text-slate-400 font-medium">Accuracy</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}