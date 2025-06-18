"use client"

import { useState, useEffect } from "react"
import { BookOpen, TrendingUp, Award, Clock } from "lucide-react"

const AdminQuickStats = ({ userId, studentId, isAdminView = false, comprehensiveData }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Format time like student dashboard
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return "0s"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  useEffect(() => {
    if (comprehensiveData) {
      // Use comprehensive data directly for admin view
      const { quickStats, testHistory } = comprehensiveData

      // Calculate raw scores from test history
      let totalRawScore = 0
      let bestRawScore = 0
      let totalTimeSpent = 0
      let testCount = 0

      if (testHistory && testHistory.length > 0) {
        testHistory.forEach((attempt) => {
          if (attempt.score) {
            const rawScore = attempt.score.obtained || 0
            totalRawScore += rawScore
            bestRawScore = Math.max(bestRawScore, rawScore)
            testCount++
          }
          if (attempt.timeSpent) {
            totalTimeSpent += attempt.timeSpent
          }
        })
      }

      const averageRawScore = testCount > 0 ? totalRawScore / testCount : 0

      setStats({
        totalTests: testCount,
        averageMarks: Math.round(averageRawScore * 100) / 100,
        bestMarks: Math.round(bestRawScore * 100) / 100,
        totalTimeSpent: totalTimeSpent,
        testTime: totalTimeSpent, // For display
      })
      setLoading(false)
    }
  }, [comprehensiveData])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-8 w-12 bg-slate-700/50 rounded animate-pulse mx-auto"></div>
                <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse mx-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="col-span-full bg-red-900/20 border border-red-600/50 rounded-xl p-6 text-center">
          <p className="text-red-400">Error loading stats: {error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="col-span-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
          <p className="text-slate-400">No stats available</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Tests Taken",
      value: stats.totalTests,
      icon: BookOpen,
      color: "emerald",
      bgColor: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-400",
    },
    {
      title: "Average Marks",
      value: stats.averageMarks,
      icon: TrendingUp,
      color: "blue",
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
      valueColor: "text-blue-400",
    },
    {
      title: "Best Marks",
      value: stats.bestMarks,
      icon: Award,
      color: "yellow",
      bgColor: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
      valueColor: "text-yellow-400",
    },
    {
      title: "Test Time",
      value: formatTime(stats.testTime),
      icon: Clock,
      color: "teal",
      bgColor: "bg-teal-500/20",
      iconColor: "text-teal-400",
      valueColor: "text-teal-400",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => {
        const IconComponent = card.icon
        return (
          <div
            key={index}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon Circle */}
              <div className={`w-16 h-16 ${card.bgColor} rounded-full flex items-center justify-center`}>
                <IconComponent className={`h-8 w-8 ${card.iconColor}`} />
              </div>

              {/* Stats */}
              <div className="space-y-1">
                <div className={`text-3xl font-bold ${card.valueColor}`}>
                  {typeof card.value === "number" && card.title !== "Test Time"
                    ? card.value.toFixed(card.title.includes("Marks") ? 2 : 0)
                    : card.value}
                </div>
                <div className="text-sm text-slate-400 font-medium">{card.title}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AdminQuickStats
