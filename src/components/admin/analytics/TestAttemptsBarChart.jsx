"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { BarChart3, Calendar, TrendingUp, Loader2 } from "lucide-react"

export default function TestAttemptsBarChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [chartData, setChartData] = useState([])
  const [summary, setSummary] = useState({ total: 0, average: 0 })
  const [maxValue, setMaxValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [animationKey, setAnimationKey] = useState(0)

  // Fetch real data from API
  useEffect(() => {
    fetchChartData()
  }, [selectedPeriod])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/analytics/test-attempts-chart?period=${selectedPeriod}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data")
      }

      if (result.success) {
        setChartData(result.data)
        setSummary(result.summary)
        setMaxValue(Math.max(...result.data.map((d) => d.value)) * 1.1 || 10)
        setAnimationKey((prev) => prev + 1)
      }
    } catch (err) {
      console.error("Error fetching chart data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const periodOptions = [
    { value: "7d", label: "Last 7 Days", icon: Calendar },
    { value: "30d", label: "Last 30 Days", icon: BarChart3 },
    { value: "1y", label: "Last Year", icon: TrendingUp },
  ]

  const getBarColor = (index, value) => {
    const intensity = maxValue > 0 ? (value / maxValue) * 100 : 0
    if (intensity > 80) return "from-emerald-500 to-teal-500"
    if (intensity > 60) return "from-blue-500 to-cyan-500"
    if (intensity > 40) return "from-purple-500 to-blue-500"
    if (intensity > 20) return "from-slate-500 to-slate-400"
    return "from-slate-600 to-slate-500"
  }

  // Format date for tooltip
  const formatTooltipDate = (item) => {
    if (item.date) {
      return `Date: ${item.date}`
    } else if (item.startDate && item.endDate) {
      return `Period: ${new Date(item.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${new Date(item.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`
    }
    return item.fullLabel
  }

  // Loading state
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-400" />
            Test Attempts Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-teal-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-400" />
            Test Attempts Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-2">⚠️</div>
              <h3 className="text-lg font-medium text-slate-400 mb-2">Error Loading Data</h3>
              <p className="text-slate-500 text-sm mb-4">{error}</p>
              <button
                onClick={fetchChartData}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (chartData.length === 0 || summary.total === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-400" />
              Test Attempts Over Time
            </CardTitle>

            {/* Period Toggle Tabs */}
            <div className="flex bg-slate-700/50 rounded-lg p-1">
              {periodOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedPeriod(option.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedPeriod === option.value
                        ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-600/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                    <span className="sm:hidden">{option.value.toUpperCase()}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-slate-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">No Test Attempts</h3>
              <p className="text-slate-500 text-sm">No test attempts found for the selected time period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-400" />
            Test Attempts Over Time
          </CardTitle>

          {/* Period Toggle Tabs */}
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            {periodOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedPeriod(option.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === option.value
                      ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-600/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                  <span className="sm:hidden">{option.value.toUpperCase()}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
            <span className="text-slate-400">Total: </span>
            <span className="text-slate-200 font-semibold">{summary.total.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <span className="text-slate-400">Average: </span>
            <span className="text-slate-200 font-semibold">{summary.average.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-16 flex flex-col justify-between text-xs text-slate-500 w-8">
            <span>{Math.round(maxValue)}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="ml-10 h-80 flex items-end justify-between gap-2 px-4 py-12 relative">
            {chartData.map((item, index) => (
              <div
                key={`${item.label}-${animationKey}`}
                className="flex-1 flex flex-col items-center group cursor-pointer relative"
              >
                {/* Hover Area - Extends full height for better hover detection */}
                <div className="absolute inset-0 w-full h-full z-10 group-hover:bg-transparent"></div>

                {/* Tooltip - Fixed positioning */}
                <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-600 shadow-xl min-w-[180px] pointer-events-none">
                  {/* Date Header */}
                  <div className="text-slate-200 font-semibold text-sm mb-2 text-center">{formatTooltipDate(item)}</div>

                  {/* Attempts with colored dot */}
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2.5 h-2.5 bg-teal-400 rounded-full"></div>
                    <span className="text-slate-300 text-sm">
                      <span className="text-teal-400 font-semibold">{item.value}</span> attempts
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95"></div>
                </div>

                {/* Bar */}
                <div className="relative w-full max-w-12 mb-3 z-20">
                  <div
                    className={`w-full bg-gradient-to-t ${getBarColor(index, item.value)} rounded-t-lg transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-teal-500/20 relative overflow-hidden`}
                    style={{
                      height: `${maxValue > 0 ? (item.value / maxValue) * 240 : 0}px`,
                      animationDelay: `${index * 100}ms`,
                      minHeight: item.value > 0 ? "4px" : "0px",
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
                  </div>
                </div>

                {/* Label */}
                <div className="text-xs text-slate-400 text-center font-medium group-hover:text-slate-200 transition-colors z-20">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Card>
  )
}
