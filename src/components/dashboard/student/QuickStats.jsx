"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { BookOpen, Target, Award, Clock, RefreshCw } from "lucide-react"

// Helper function to format time like in student dashboard
const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return "0s"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${hours}h`
  } else if (minutes > 0) {
    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${minutes}m`
  } else {
    return `${remainingSeconds}s`
  }
}

export default function QuickStats({ userId, studentId, isAdminView = false }) {
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    totalTimeSpentHours: 0,
    averageRawScore: 0,
    bestRawScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState("")

  useEffect(() => {
    fetchQuickStats()
  }, [userId, studentId, isAdminView])

  const fetchQuickStats = async () => {
    try {
      setLoading(true)
      setError("")
      setDebugInfo("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required")
        return
      }

      console.log("🔍 QuickStats - Fetching data...")
      console.log("  isAdminView:", isAdminView)
      console.log("  studentId:", studentId)
      console.log("  userId:", userId)

      let response
      let debugMsg = ""

      if (isAdminView && (studentId || userId)) {
        const targetId = studentId || userId
        console.log("📊 Using admin comprehensive API for:", targetId)
        debugMsg = `Admin view for student: ${targetId}`

        response = await fetch(`/api/admin/analytics/students/${targetId}/comprehensive`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      } else {
        console.log("📊 Using student stats API")
        debugMsg = "Student view - own stats"

        response = await fetch("/api/student/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      }

      console.log("📡 Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Data received:", result)

        let statsData
        if (isAdminView) {
          statsData = result.data?.quickStats || {}
          debugMsg += ` | Tests: ${statsData.totalTests} | Best: ${statsData.bestRawScore || statsData.bestScore}`
        } else {
          statsData = result.data || {}
          debugMsg += ` | Tests: ${statsData.totalTests} | Best: ${statsData.bestRawScore || statsData.bestScore}`
        }

        setStats({
          totalTests: statsData.totalTests || 0,
          averageScore: statsData.averageScore || 0,
          bestScore: statsData.bestScore || 0,
          totalTimeSpent: statsData.totalTimeSpent || 0,
          totalTimeSpentHours: statsData.totalTimeSpentHours || 0,
          averageRawScore: statsData.averageRawScore || 0,
          bestRawScore: statsData.bestRawScore || 0,
        })

        setDebugInfo(debugMsg)
        console.log("✅ Stats updated:", statsData)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ API Error:", response.status, errorData)
        setError(errorData.error || `HTTP ${response.status}: Failed to fetch stats`)
        setDebugInfo(`Error: ${response.status} - ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("❌ Fetch error:", error)
      setError("Network error: " + error.message)
      setDebugInfo(`Network error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-700 rounded mb-2"></div>
                    <div className="h-6 bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6">
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-4">
            <div className="text-red-400">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Error loading statistics</span>
                <button onClick={fetchQuickStats} className="p-1 hover:bg-red-800/30 rounded" title="Retry">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm">{error}</p>
              {debugInfo && <p className="text-xs text-red-300 mt-1 font-mono">{debugInfo}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format stats like student dashboard
  const statCards = [
    {
      title: isAdminView ? "Tests Taken" : "Tests Taken",
      value: stats.totalTests || 0,
      icon: BookOpen,
      color: "emerald",
      bgColor: "bg-emerald-500/20",
      textColor: "text-emerald-400",
    },
    {
      title: isAdminView ? "Average Marks" : "Average Marks",
      value: stats.averageRawScore
        ? Math.round(stats.averageRawScore * 100) / 100
        : Math.round((stats.averageScore || 0) * 100) / 100,
      icon: Target,
      color: "blue",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-400",
    },
    {
      title: isAdminView ? "Best Marks" : "Best Marks",
      value: stats.bestRawScore
        ? Math.round(stats.bestRawScore * 100) / 100
        : Math.round((stats.bestScore || 0) * 100) / 100,
      icon: Award,
      color: "purple",
      bgColor: "bg-purple-500/20",
      textColor: "text-purple-400",
    },
    {
      title: isAdminView ? "Test Time" : "Test Time",
      value: formatTime(Math.round(stats.totalTimeSpent || 0)),
      icon: Clock,
      color: "teal",
      bgColor: "bg-teal-500/20",
      textColor: "text-teal-400",
    },
  ]

  return (
    <div className="mb-6">
      {/* Debug info for development */}
      {debugInfo && (
        <div className="mb-2 p-2 bg-slate-800/30 rounded text-xs text-slate-400 font-mono">Debug: {debugInfo}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${stat.bgColor} rounded-lg shrink-0`}>
                    <IconComponent className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-400">{stat.title}</p>
                    <p className="text-xl font-bold text-slate-200 truncate">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
