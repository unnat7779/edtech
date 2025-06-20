"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Award, Home, RefreshCw, LayoutDashboard, LayoutGrid, Layers, Target } from "lucide-react"
import Breadcrumb from "@/components/ui/Breadcrumb"
import GlobalMetricsCards from "@/components/admin/analytics/GlobalMetricsCards"
import RadialMetricsDashboard from "@/components/admin/analytics/RadialMetricsDashboard"
import ClusteredMetricsDashboard from "@/components/admin/analytics/ClusteredMetricsDashboard"
import TestAttemptsChart from "@/components/admin/analytics/TestAttemptsChart"
import RetentionChart from "@/components/admin/analytics/RetentionChart"
import FunnelChart from "@/components/admin/analytics/FunnelChart"
import ScoreDistributionChart from "@/components/admin/analytics/ScoreDistributionChart"
import UserTypeChart from "@/components/admin/analytics/UserTypeChart"
import ScoreTrendChart from "@/components/admin/analytics/ScoreTrendChart"
import AttemptDistributionChart from "@/components/admin/analytics/AttemptDistributionChart"
import CategoryHeatmapChart from "@/components/admin/analytics/CategoryHeatmapChart"
import { useAdvancedAnalyticsData } from "@/hooks/useAdvancedAnalyticsData"
import LeetCodeStyleDashboard from "@/components/admin/analytics/LeetCodeStyleDashboard"

export default function GlobalAnalyticsPage() {
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("7d")
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState("leetcode") // "radial", "cards", "clustered", or "leetcode"

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

  if (loading || advancedLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-teal-400 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-slate-300">Loading global analytics...</div>
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
          
              { label: "Global Metrics" },
            ]}
          />
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Global Analytics
              </h1>
              <p className="text-slate-400 mt-1">Comprehensive platform performance metrics and insights</p>
            </div>
            <div className="flex items-center gap-3">
              {/* <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("leetcode")}
                  className={`px-3 py-2 flex items-center ${
                    viewMode === "leetcode" ? "bg-slate-700 text-white" : "text-slate-300"
                  }`}
                >
                  <Target className="h-4 w-4 mr-2" />
                  LeetCode
                </button>
                <button
                  onClick={() => setViewMode("clustered")}
                  className={`px-3 py-2 flex items-center ${
                    viewMode === "clustered" ? "bg-slate-700 text-white" : "text-slate-300"
                  }`}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Clustered
                </button>
                <button
                  onClick={() => setViewMode("radial")}
                  className={`px-3 py-2 flex items-center ${
                    viewMode === "radial" ? "bg-slate-700 text-white" : "text-slate-300"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Radial
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-2 flex items-center ${
                    viewMode === "cards" ? "bg-slate-700 text-white" : "text-slate-300"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Cards
                </button>
              </div> */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-800 border border-slate-600  text-slate-300 rounded-lg p-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={() => router.push("/admin/analytics")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Back to Analytics
              </Button>
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
            {/* Global Metrics - Toggle between different view modes */}
            <div className="mb-8">
              {viewMode === "leetcode" ? (
                <LeetCodeStyleDashboard data={analyticsData.globalMetrics} />
              ) : viewMode === "clustered" ? (
                <ClusteredMetricsDashboard data={analyticsData.globalMetrics} />
              ) : (
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Key Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {viewMode === "radial" ? (
                      <RadialMetricsDashboard data={analyticsData.globalMetrics} />
                    ) : (
                      <GlobalMetricsCards data={analyticsData.globalMetrics} />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* New Charts - Score Trend and Attempt Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Score Trend Chart */}
              {/* <ScoreTrendChart data={scoreTrendData} timeRange={timeRange} /> */}
               <RetentionChart data={analyticsData.retention} />

              {/* Attempt Distribution Chart */}
             
                  <AttemptDistributionChart data={attemptDistributionData} />
              
              
            </div>

            {/* Category Performance Heatmap - Full Width */}
            <div className="mb-8">
              {/* <CategoryHeatmapChart data={categoryHeatmapData} /> */}
            </div>

            {/* Original Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Test Attempts Over Time */}
              {/* <TestAttemptsChart data={analyticsData} timeRange={timeRange} /> */}
{/*  */}
              {/* User Type Breakdown */}
              {/* <UserTypeChart data={analyticsData.userTypeBreakdown} /> */}

              {/* Retention Analysis */}
              {/* <RetentionChart data={analyticsData.retention} /> */}

              {/* Score Distribution */}
              {/* <ScoreDistributionChart data={analyticsData.scoreDistribution} /> */}
            </div>

            {/* Funnel Analysis - Full Width */}
            <div className="mb-8">
              <FunnelChart data={analyticsData.funnel} />
            </div>

            {/* Top Performers Section */}
            {/* <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.topPerformers.slice(0, 6).map((performer, index) => (
                    <div
                      key={performer._id}
                      className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-slate-200 font-medium text-sm">{performer.name}</p>
                            <p className="text-slate-400 text-xs">{performer.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400">Avg Score</p>
                          <p className="text-teal-400 font-semibold">{performer.avgScore}%</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Attempts</p>
                          <p className="text-blue-400 font-semibold">{performer.totalAttempts}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {analyticsData.topPerformers.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => router.push("/admin/analytics/students")}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      View All Students
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card> */}
          </>
        )}
      </div>
    </div>
  )
}
