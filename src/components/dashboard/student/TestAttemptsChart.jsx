"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Calendar, TrendingUp, RefreshCw, Filter } from "lucide-react"

export default function TestAttemptsChart({ studentId, isAdminView = false }) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState("week")
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [dateRange, setDateRange] = useState("")

  useEffect(() => {
    fetchChartData()
  }, [studentId, timeRange])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      console.log("🔍 Fetching test attempts chart data...")
      console.log("Student ID:", studentId)
      console.log("Time Range:", timeRange)
      console.log("Is Admin View:", isAdminView)

      // Use different endpoint for admin view
      const endpoint =
        isAdminView && studentId
          ? `/api/admin/analytics/students/${studentId}/test-attempts-chart?timeRange=${timeRange}`
          : `/api/student/analytics/chart?timeRange=${timeRange}`

      console.log("📡 API Endpoint:", endpoint)

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Response Status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ API Error:", errorData)
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("📊 Raw API Response:", result)

      if (result.success) {
        const processedData = processChartData(result.data.chartData || [])
        console.log("📊 Processed Chart Data:", processedData)

        setChartData(processedData)
        setTotalAttempts(result.data.totalAttempts || 0)

        // Format date range for display
        if (result.data.dateRange) {
          const start = new Date(result.data.dateRange.start).toLocaleDateString()
          const end = new Date(result.data.dateRange.end).toLocaleDateString()
          setDateRange(`${start} - ${end}`)
        }

        setError(null)
      } else {
        throw new Error(result.error || "Failed to fetch chart data")
      }
    } catch (error) {
      console.error("❌ Error fetching chart data:", error)
      setError(error.message)
      setChartData([])
      setTotalAttempts(0)
    } finally {
      setLoading(false)
    }
  }

  const processChartData = (rawData) => {
    return rawData.map((item) => ({
      ...item,
      // Ensure we have proper labels for the chart
      label: item.label || formatDateLabel(item.date),
      // Ensure numeric values
      Physics: Number(item.Physics || 0),
      Chemistry: Number(item.Chemistry || 0),
      Mathematics: Number(item.Mathematics || 0),
      total: Number(item.total || 0),
    }))
  }

  const formatDateLabel = (dateStr) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return dateStr
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0)
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-slate-200 mb-2">{label}</p>
          <p className="text-sm text-slate-400 mb-2">Total: {total} attempts</p>
          {payload.map(
            (entry, index) =>
              entry.value > 0 && (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-300">
                    {entry.dataKey}: {entry.value}
                  </span>
                </div>
              ),
          )}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
            <div className="h-8 bg-slate-700/50 rounded w-24"></div>
          </div>
          <div className="h-64 bg-slate-700/50 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6">
        <div className="text-center text-slate-400">
          <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-red-400 mb-2">Error loading chart data</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={fetchChartData}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (totalAttempts === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6">
        <div className="text-center text-slate-400">
          <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No test attempts found</p>
          <p className="text-sm mt-2">Take some tests to see your progress chart!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-1">
            Test Attempts - {timeRange === "week" ? "This Week" : timeRange === "month" ? "This Month" : "This Year"}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Total: {totalAttempts} attempts
            </div>
            {dateRange && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {dateRange}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={fetchChartData}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 text-slate-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
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
            {/* <Legend /> */}
            <Bar dataKey="Physics" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Physics" />
            <Bar dataKey="Chemistry" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Chemistry" />
            <Bar dataKey="Mathematics" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Mathematics" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex mt-6 items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className="text-slate-300">Physics</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-slate-300">Chemistry</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span className="text-slate-300">Mathematics</span>
        </div>
      </div>
    </div>
  )
}
