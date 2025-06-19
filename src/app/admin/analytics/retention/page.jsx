"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Breadcrumb from "@/components/ui/Breadcrumb"
import RetentionChart from "@/components/admin/analytics/RetentionChart"
import CohortHeatmap from "@/components/admin/analytics/CohortHeatmap"
import RetentionLineChart from "@/components/admin/analytics/RetentionLineChart"
import RetentionBarChart from "@/components/admin/analytics/RetentionBarChart"
import {
  TrendingUp,
  Users,
  BarChart3,
  LineChart,
  Home,
  ArrowLeft,
  Download,
  RefreshCw,
  Calendar,
  Target,
} from "lucide-react"

export default function RetentionAnalyticsPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState("overview")
  const [timeRange, setTimeRange] = useState("30")
  const [cohortType, setCohortType] = useState("weekly")
  const [refreshKey, setRefreshKey] = useState(0)

  const views = [
    {
      id: "overview",
      label: "Overview",
      icon: TrendingUp,
      description: "Complete retention analysis dashboard",
    },
    {
      id: "trends",
      label: "Trends",
      icon: LineChart,
      description: "Historical retention trends over time",
    },
    {
      id: "cohorts",
      label: "Cohorts",
      icon: Users,
      description: "Cohort-based retention heatmap",
    },
    {
      id: "comparison",
      label: "Comparison",
      icon: BarChart3,
      description: "Comparative retention analysis",
    },
  ]

  const timeRanges = [
    { value: "7", label: "7 Days" },
    { value: "14", label: "14 Days" },
    { value: "30", label: "30 Days" },
    { value: "60", label: "60 Days" },
    { value: "90", label: "90 Days" },
  ]

  const cohortTypes = [
    { value: "weekly", label: "Weekly Cohorts" },
    { value: "monthly", label: "Monthly Cohorts" },
  ]

  const handleRefreshAll = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const exportAllData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/analytics/retention?timeRange=${timeRange}&cohortType=${cohortType}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const dataStr = JSON.stringify(data, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `retention-analysis-${new Date().toISOString().split("T")[0]}.json`
        link.click()
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: "Home", path: "/", icon: Home },
              { label: "Admin Dashboard", path: "/admin" },
              { label: "Analytics", path: "/admin/analytics" },
              { label: "Retention Analysis" },
            ]}
          />
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                User Retention Analytics
              </h1>
              <p className="text-slate-400 mt-1">Comprehensive analysis of user engagement and return patterns</p>
            </div>
            <Button
              onClick={() => router.push("/admin/analytics")}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                {/* View Selector */}
                <div className="flex flex-wrap gap-2">
                  {views.map((view) => {
                    const Icon = view.icon
                    return (
                      <button
                        key={view.id}
                        onClick={() => setActiveView(view.id)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          flex items-center gap-2 group
                          ${
                            activeView === view.id
                              ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg"
                              : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                          }
                        `}
                        title={view.description}
                      >
                        <Icon className="h-4 w-4" />
                        {view.label}
                      </button>
                    )
                  })}
                </div>

                {/* Settings */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Time Range */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="bg-slate-700/50 text-slate-200 text-sm px-3 py-2 rounded-lg border border-slate-600 focus:border-teal-500 focus:outline-none"
                    >
                      {timeRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cohort Type */}
                  {(activeView === "cohorts" || activeView === "overview") && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <select
                        value={cohortType}
                        onChange={(e) => setCohortType(e.target.value)}
                        className="bg-slate-700/50 text-slate-200 text-sm px-3 py-2 rounded-lg border border-slate-600 focus:border-teal-500 focus:outline-none"
                      >
                        {cohortTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleRefreshAll}
                      size="sm"
                      className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-200"
                      title="Refresh all data"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={exportAllData}
                      size="sm"
                      className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-200"
                      title="Export data"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeView === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-8">
                <RetentionChart key={`retention-${refreshKey}`} />
                <RetentionBarChart key={`bar-${refreshKey}`} timeRange={timeRange} />
              </div>
              <div className="space-y-8">
                <CohortHeatmap key={`cohort-${refreshKey}`} cohortType={cohortType} periods={12} />
                <RetentionLineChart key={`line-${refreshKey}`} timeRange={timeRange} />
              </div>
            </div>
          )}

          {activeView === "trends" && (
            <div className="space-y-8">
              <RetentionLineChart key={`trends-${refreshKey}`} timeRange={timeRange} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RetentionChart key={`trends-retention-${refreshKey}`} />
                <RetentionBarChart key={`trends-bar-${refreshKey}`} timeRange={timeRange} />
              </div>
            </div>
          )}

          {activeView === "cohorts" && (
            <div className="space-y-8">
              <CohortHeatmap key={`cohorts-main-${refreshKey}`} cohortType={cohortType} periods={16} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RetentionChart key={`cohorts-retention-${refreshKey}`} />
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-slate-200 flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-400" />
                      Cohort Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-700/30 rounded-lg">
                        <h4 className="text-slate-200 font-medium mb-2">Best Performing Cohort</h4>
                        <p className="text-slate-400 text-sm">
                          Cohorts with higher initial engagement tend to have better long-term retention rates.
                        </p>
                      </div>
                      <div className="p-4 bg-slate-700/30 rounded-lg">
                        <h4 className="text-slate-200 font-medium mb-2">Retention Patterns</h4>
                        <p className="text-slate-400 text-sm">
                          Most users who return within 7 days are likely to become long-term active users.
                        </p>
                      </div>
                      <div className="p-4 bg-slate-700/30 rounded-lg">
                        <h4 className="text-slate-200 font-medium mb-2">Optimization Opportunities</h4>
                        <p className="text-slate-400 text-sm">
                          Focus on improving the first-week experience to boost overall retention rates.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === "comparison" && (
            <div className="space-y-8">
              <RetentionBarChart key={`comparison-main-${refreshKey}`} timeRange={timeRange} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RetentionLineChart key={`comparison-line-${refreshKey}`} timeRange={timeRange} />
                <RetentionChart key={`comparison-retention-${refreshKey}`} />
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12">
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-slate-200 font-medium mb-1">Retention Tracking</h3>
                  <p className="text-slate-400 text-sm">
                    Monitor user return patterns across different time periods to optimize engagement strategies.
                  </p>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-slate-200 font-medium mb-1">Cohort Analysis</h3>
                  <p className="text-slate-400 text-sm">
                    Compare performance across user groups to identify successful onboarding patterns.
                  </p>
                </div>
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-slate-200 font-medium mb-1">Data-Driven Insights</h3>
                  <p className="text-slate-400 text-sm">
                    Make informed decisions based on comprehensive retention metrics and trends.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
