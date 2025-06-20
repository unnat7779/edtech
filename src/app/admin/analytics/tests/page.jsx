"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Award, Home, RefreshCw, BarChart3, TrendingUp, Users, Target } from "lucide-react"
import Breadcrumb from "@/components/ui/Breadcrumb"
import LeetCodeStyleDashboard from "@/components/admin/analytics/LeetCodeStyleDashboard"
import ScoreTrendChart from "@/components/admin/analytics/ScoreTrendChart"
import AttemptDistributionChart from "@/components/admin/analytics/AttemptDistributionChart"
import CategoryHeatmapChart from "@/components/admin/analytics/CategoryHeatmapChart"
import TestAttemptsBarChart from "@/components/admin/analytics/TestAttemptsBarChart"
import { useAdvancedAnalyticsData } from "@/hooks/useAdvancedAnalyticsData"
import StudentScoreDistributionPieChart from "@/components/admin/analytics/StudentScoreDistributionPieChart"

export default function TestAnalyticsPage() {
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("7d")
  const [refreshing, setRefreshing] = useState(false)

  // Fetch advanced analytics data
  const {
    scoreTrendData,
    attemptDistributionData,
    categoryHeatmapData,
    loading: advancedLoading,
    error: advancedError,
  } = useAdvancedAnalyticsData(timeRange)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/analytics/global?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data.data)
      } else {
        throw new Error("Failed to fetch analytics data")
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalyticsData()
    setRefreshing(false)
  }

  const timeRangeOptions = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" },
  ]

  // Sort and limit top performers
  const getTopPerformers = (performers) => {
    if (!performers || !Array.isArray(performers)) return []

    return performers
      .sort((a, b) => {
        // Primary sort: Average score (descending)
        const scoreA = a.averageScore || 0
        const scoreB = b.averageScore || 0

        if (scoreB !== scoreA) {
          return scoreB - scoreA
        }

        // Tiebreaker: Total attempts (descending - more attempts wins)
        const attemptsA = a.totalAttempts || 0
        const attemptsB = b.totalAttempts || 0
        return attemptsB - attemptsA
      })
      .slice(0, 3) // Limit to top 3 performers
  }

  if (loading || advancedLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading test analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: "Home", path: "/", icon: Home },
              { label: "Admin Dashboard", path: "/admin" },

              { label: "Test Analytics" },
            ]}
          />
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Test Analytics Dashboard
              </h1>
              <p className="text-slate-400 mt-1">Comprehensive test performance metrics and insights</p>
            </div>
            <div className="flex items-center gap-3">
              {/* <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select> */}
              <Button
                onClick={() => router.push("/admin/analytics/test-wise")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Test Wise Analysis
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {/* <Button
                onClick={() => router.push("/admin/analytics")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Back to Analytics
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(error || advancedError) && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 text-red-300 rounded-lg">
            {error || advancedError}
          </div>
        )}

        {analyticsData && (
          <>
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTopPerformers(analyticsData.topPerformers).map((performer, index) => {
                    // Determine rank styling
                    const getRankStyling = (rank) => {
                      switch (rank) {
                        case 0: // 1st place
                          return {
                            gradient: "from-yellow-400 to-yellow-600",
                            textColor: "text-yellow-900",
                            borderColor: "border-yellow-400/30",
                            bgColor: "bg-gradient-to-br from-yellow-900/20 to-yellow-800/20",
                          }
                        case 1: // 2nd place
                          return {
                            gradient: "from-gray-300 to-gray-500",
                            textColor: "text-gray-900",
                            borderColor: "border-gray-400/30",
                            bgColor: "bg-gradient-to-br from-gray-900/20 to-gray-800/20",
                          }
                        case 2: // 3rd place
                          return {
                            gradient: "from-amber-500 to-amber-700",
                            textColor: "text-amber-900",
                            borderColor: "border-amber-400/30",
                            bgColor: "bg-gradient-to-br from-amber-900/20 to-amber-800/20",
                          }
                        default:
                          return {
                            gradient: "from-teal-500 to-blue-500",
                            textColor: "text-white",
                            borderColor: "border-slate-600/30",
                            bgColor: "bg-slate-700/30",
                          }
                      }
                    }

                    const styling = getRankStyling(index)

                    return (
                      <div
                        key={performer._id}
                        className={`${styling.bgColor} rounded-lg p-4 border ${styling.borderColor} hover:border-slate-500/50 transition-all duration-200 transform hover:scale-105`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-r ${styling.gradient} rounded-full flex items-center justify-center ${styling.textColor} font-bold text-sm shadow-lg`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-slate-200 font-medium text-sm">
                                {performer.student?.name || "Unknown"}
                              </p>
                              <p className="text-slate-400 text-xs">{performer.student?.email || "No email"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="text-center p-2 bg-slate-800/40 rounded">
                            <p className="text-slate-400 mb-1">Avg Score</p>
                            <p className="text-teal-400 font-bold text-lg">
                              {Math.round(performer.averageScore || 0)}%
                            </p>
                          </div>
                          <div className="text-center p-2 bg-slate-800/40 rounded">
                            <p className="text-slate-400 mb-1">Attempts</p>
                            <p className="text-blue-400 font-bold text-lg">{performer.totalAttempts || 0}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {analyticsData.topPerformers && analyticsData.topPerformers.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => router.push("/admin/analytics/students")}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      View All
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* LeetCode Style Performance Metrics */}
            <div className="mb-8 mt-8">
              <LeetCodeStyleDashboard data={analyticsData.globalMetrics} />
            </div>

            {/* Test Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Score Trend Chart */}
              <ScoreTrendChart data={scoreTrendData} timeRange={timeRange} />

              {/* Test Attempts Bar Chart - Replace the old TestAttemptsChart */}
              <TestAttemptsBarChart data={analyticsData} timeRange={timeRange} />
            </div>

            {/* Attempt Distribution and Score Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Attempt Distribution Chart */}
              <AttemptDistributionChart data={attemptDistributionData} />

              {/* Student Score Distribution Pie Chart */}
              <StudentScoreDistributionPieChart timeRange={timeRange} />
            </div>

            {/* Category Performance Heatmap - Full Width */}
            {/* <div className="mb-8">
              <CategoryHeatmapChart data={categoryHeatmapData} />
            </div> */}

            {/* Top Performers Section */}
            

            {/* Quick Stats Summary */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{analyticsData.globalMetrics?.totalAttempts || 0}</div>
                  <div className="text-sm text-blue-300">Total Attempts</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border border-emerald-700/30">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {Math.round(analyticsData.globalMetrics?.averageTestScore || 0)}%
                  </div>
                  <div className="text-sm text-emerald-300">Average Score</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/30">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{analyticsData.globalMetrics?.activeUsers || 0}</div>
                  <div className="text-sm text-purple-300">Active Users</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border border-amber-700/30">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {analyticsData.globalMetrics?.averageTimePerTest
                      ? `${analyticsData.globalMetrics.averageTimePerTest}m`
                      : "N/A"}
                  </div>
                  <div className="text-sm text-amber-300">Avg Time</div>
                </CardContent>
              </Card>
            </div> */}
          </>
        )}
      </div>
    </div>
  )
}
