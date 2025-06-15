"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { TrendingUp, TrendingDown, Minus, Calendar, Filter, Award, Clock, Target, RefreshCw } from "lucide-react"

export default function ProgressChart({ studentId }) {
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    timeRange: "all",
    subject: "all",
  })
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchProgressData()
  }, [filters, studentId])

  const fetchProgressData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const params = new URLSearchParams(filters)
      console.log("🔍 Fetching progress with filters:", filters)

      const response = await fetch(`/api/student/progress?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("📊 Progress data received:", result)

      if (result.success) {
        setProgressData(result.data)
        setError(null)
      } else {
        throw new Error(result.error || "Failed to fetch progress data")
      }
    } catch (error) {
      console.error("❌ Error fetching progress:", error)
      setError(error.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchProgressData(true)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl">
          <div className="space-y-2">
            <div className="font-semibold text-slate-200">{data.testTitle}</div>
            <div className="text-sm text-slate-400">
              {data.isRetake ? `Attempt #${data.attemptNumber}` : "First Attempt"}
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-400" />
              <span className="text-slate-300">
                Score: {data.score.obtained}/{data.score.total} ({data.y.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-slate-300">
                Time: {Math.floor(data.timeSpent / 60)}m {data.timeSpent % 60}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-400" />
              <span className="text-slate-300">{new Date(data.date).toLocaleDateString()}</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 px-2 py-1 bg-slate-700/50 rounded">Subject: {data.subject}</div>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    const isHovered = hoveredPoint === payload.x

    return (
      <g>
        {/* Outer glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? 8 : 6}
          fill="none"
          stroke={payload.isRetake ? "#f59e0b" : "#10b981"}
          strokeWidth={2}
          opacity={isHovered ? 0.6 : 0.3}
        />
        {/* Main dot */}
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? 5 : 4}
          fill={payload.isRetake ? "#f59e0b" : "#10b981"}
          stroke="#1e293b"
          strokeWidth={2}
          className="cursor-pointer transition-all duration-200"
        />
        {/* Inner highlight */}
        <circle cx={cx} cy={cy} r={isHovered ? 2 : 1.5} fill="#ffffff" opacity={0.8} />
      </g>
    )
  }

  const getImprovementIcon = (rate) => {
    if (rate > 5) return <TrendingUp className="h-4 w-4 text-green-400" />
    if (rate < -5) return <TrendingDown className="h-4 w-4 text-red-400" />
    return <Minus className="h-4 w-4 text-yellow-400" />
  }

  const getImprovementColor = (rate) => {
    if (rate > 5) return "text-green-400"
    if (rate < -5) return "text-red-400"
    return "text-yellow-400"
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="h-64 bg-slate-700/50 rounded"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
        <div className="text-center text-slate-400">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-red-400 mb-2">Error loading progress data</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </Card>
    )
  }

  if (!progressData || !progressData.trendData || progressData.trendData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
        <div className="text-center text-slate-400">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No progress data available</p>
          <p className="text-sm mt-2">Complete some tests to see your progress!</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </Card>
    )
  }

  const { trendData, overallStats } = progressData

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> */}
        {/* <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">{overallStats.totalTests}</div>
              <div className="text-sm text-slate-400">Tests Taken</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">{overallStats.averageScore.toFixed(1)}%</div>
              <div className="text-sm text-slate-400">Average Score</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Award className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">{overallStats.bestScore.toFixed(1)}%</div>
              <div className="text-sm text-slate-400">Best Score</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">{getImprovementIcon(overallStats.improvementRate)}</div>
            <div>
              <div className={`text-2xl font-bold ${getImprovementColor(overallStats.improvementRate)}`}>
                {overallStats.improvementRate > 0 ? "+" : ""}
                {overallStats.improvementRate.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Improvement</div>
            </div>
          </div>
        </Card> */}
      {/* </div> */}

      {/* Filters */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-auto flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 text-white rounded-lg transition-colors text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </Card>

      {/* Chart */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-200 mb-2">Performance Progress</h3>
          <p className="text-slate-400 text-sm">
            Track your test scores over time. Green dots are first attempts, orange dots are retakes.
          </p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onMouseMove={(e) => {
                if (e && e.activeLabel) {
                  setHoveredPoint(e.activeLabel)
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="x"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: "Test Attempts", position: "insideBottom", offset: -10, style: { fill: "#9ca3af" } }}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                label={{ value: "Score (%)", angle: -90, position: "insideLeft", style: { fill: "#9ca3af" } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={overallStats.averageScore} stroke="#6366f1" strokeDasharray="5 5" opacity={0.6} />
              <Line
                type="monotone"
                dataKey="y"
                stroke="url(#progressGradient)"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#ffffff" }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-sm text-slate-400">First Attempt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-sm text-slate-400">Retake</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-0.5 bg-purple-400 opacity-60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, transparent, transparent 3px, #a855f7 3px, #a855f7 6px)",
              }}
            ></div>
            <span className="text-sm text-slate-400">Average Score</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
