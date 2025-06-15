"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { BarChart3, Filter, Calendar, TrendingUp } from "lucide-react"

export default function TestAttemptsChart({ studentId }) {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState("thisWeek")
  const [selectedBar, setSelectedBar] = useState(null)

  useEffect(() => {
    fetchChartData()
  }, [timeRange, studentId])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/student/analytics/chart?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch chart data")
      }

      const result = await response.json()
      if (result.success) {
        setChartData(result.data)
      } else {
        throw new Error(result.error || "Failed to load chart data")
      }
    } catch (error) {
      console.error("Error fetching chart data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl min-w-[200px]">
          <div className="space-y-3">
            <div className="font-semibold text-slate-200 text-base">{data.label}</div>

            <div className="space-y-2">
              <div className="text-sm text-slate-400">Total Tests: {data.total}</div>
              {data.averageScore > 0 && (
                <div className="text-sm text-slate-400">Average Score: {data.averageScore.toFixed(1)}%</div>
              )}
              {data.totalScore > 0 && (
                <div className="text-sm text-slate-400">
                  Total Score: {data.totalScore}/{data.maxPossibleScore}
                </div>
              )}
            </div>

            {/* Subject breakdown */}
            <div className="space-y-2 border-t border-slate-600/30 pt-2">
              <div className="text-xs text-slate-500 font-medium">Subject Breakdown:</div>
              {data.Physics > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-xs text-slate-300">Physics</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {data.Physics} tests ({data.subjectScores?.Physics || 0} pts)
                  </div>
                </div>
              )}
              {data.Chemistry > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-xs text-slate-300">Chemistry</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {data.Chemistry} tests ({data.subjectScores?.Chemistry || 0} pts)
                  </div>
                </div>
              )}
              {data.Mathematics > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-xs text-slate-300">Mathematics</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {data.Mathematics} tests ({data.subjectScores?.Mathematics || 0} pts)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const handleBarClick = (data) => {
    setSelectedBar(data)
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "thisWeek":
        return "This Week"
      case "last4Weeks":
        return "Last 4 Weeks"
      case "12Months":
        return "Last 12 Months"
      default:
        return "This Week"
    }
  }

  if (loading) {
    return (
      <div id="analytics" className="space-y-4">
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardContent className="p-4 sm:p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
              <div className="h-64 bg-slate-700/50 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div id="analytics" className="space-y-4">
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center text-red-400">
              <p>Error loading chart data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!chartData || !chartData.chartData || chartData.chartData.length === 0) {
    return (
      <div id="analytics" className="space-y-4">
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center text-slate-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No test data available for {getTimeRangeLabel().toLowerCase()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div id="analytics" className="space-y-4">
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
              Test Attempts - {getTimeRangeLabel()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="thisWeek">This Week</option>
                <option value="last4Weeks">Last 4 Weeks</option>
                <option value="12Months">12 Months</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Total: {chartData.totalAttempts} attempts</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs sm:text-sm">
                {new Date(chartData.dateRange.start).toLocaleDateString()} -{" "}
                {new Date(chartData.dateRange.end).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                onClick={handleBarClick}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="label"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={timeRange === "12Months" ? -45 : 0}
                  textAnchor={timeRange === "12Months" ? "end" : "middle"}
                  height={timeRange === "12Months" ? 60 : 30}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Number of Tests",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#9ca3af" },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="Physics"
                  stackId="a"
                  fill="#3b82f6"
                  name="Physics"
                  radius={[0, 0, 0, 0]}
                  cursor="pointer"
                />
                <Bar
                  dataKey="Chemistry"
                  stackId="a"
                  fill="#10b981"
                  name="Chemistry"
                  radius={[0, 0, 0, 0]}
                  cursor="pointer"
                />
                <Bar
                  dataKey="Mathematics"
                  stackId="a"
                  fill="#8b5cf6"
                  name="Mathematics"
                  radius={[2, 2, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Selected bar details */}
          {selectedBar && (
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <h4 className="font-medium text-slate-200 mb-3">{selectedBar.label} - Detailed Breakdown</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{selectedBar.Physics}</div>
                  <div className="text-sm text-slate-400">Physics Tests</div>
                  <div className="text-xs text-slate-500">{selectedBar.subjectScores?.Physics || 0} points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{selectedBar.Chemistry}</div>
                  <div className="text-sm text-slate-400">Chemistry Tests</div>
                  <div className="text-xs text-slate-500">{selectedBar.subjectScores?.Chemistry || 0} points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{selectedBar.Mathematics}</div>
                  <div className="text-sm text-slate-400">Mathematics Tests</div>
                  <div className="text-xs text-slate-500">{selectedBar.subjectScores?.Mathematics || 0} points</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold text-slate-200">
                  Total: {selectedBar.totalScore}/{selectedBar.maxPossibleScore} points (
                  {selectedBar.averageScore.toFixed(1)}%)
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
