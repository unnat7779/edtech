"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Calendar, Flame, Trophy, Target, RefreshCw } from "lucide-react"

export default function ActivityHeatmap({ studentId }) {
  const [streakData, setStreakData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [hoveredCell, setHoveredCell] = useState(null)

  useEffect(() => {
    fetchStreakData()
  }, [studentId])

  const fetchStreakData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      console.log("🔍 Fetching streak data from API...")

      const response = await fetch("/api/student/streak", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 API Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API Error response:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log("📊 API Response data:", result)

      if (result.success) {
        setStreakData(result.data)
        console.log("✅ Streak data loaded successfully")
      } else {
        throw new Error(result.error || "Failed to load streak data")
      }
    } catch (error) {
      console.error("❌ Error fetching streak data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getActivityColor = (level) => {
    const colors = {
      0: "bg-slate-800/30 border-slate-700/20", // No activity
      1: "bg-green-900/40 border-green-800/30", // Low activity
      2: "bg-green-700/60 border-green-600/40", // Medium activity
      3: "bg-green-500/80 border-green-400/50", // High activity
      4: "bg-green-400 border-green-300/60", // Very high activity
    }
    return colors[level] || colors[0]
  }

  const getActivityText = (count) => {
    if (count === 0) return "No tests"
    if (count === 1) return "1 test"
    return `${count} tests`
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getMonthLabels = () => {
    const months = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toLocaleDateString("en-US", { month: "short" }))
    }
    return months
  }

  const getDayLabels = () => {
    return ["Mon", "", "Wed", "", "Fri", "", ""]
  }

  const generateHeatmapGrid = () => {
    if (!streakData?.heatmapData) return []

    const grid = []
    const heatmapData = streakData.heatmapData

    // Group by weeks
    const weeks = []
    for (let i = 0; i < heatmapData.length; i += 7) {
      weeks.push(heatmapData.slice(i, i + 7))
    }

    return weeks
  }

  if (loading) {
    return (
      <div id="activity" className="space-y-6">
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
              <div className="h-32 bg-slate-700/50 rounded"></div>
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-teal-400" />
                <span className="ml-2 text-slate-400">Loading activity data...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div id="activity" className="space-y-6">
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-red-400">
                <p className="font-medium">Error loading activity data</p>
                <p className="text-sm text-slate-400 mt-2">{error}</p>
              </div>
              <button
                onClick={fetchStreakData}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!streakData) {
    return (
      <div id="activity" className="space-y-6">
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardContent className="p-6">
            <div className="text-center text-slate-400">
              <p>No activity data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { heatmapData, dailyStreak, weeklyStreak, overallStats, achievements, yearlyStats, monthlyStats } = streakData
  const heatmapGrid = generateHeatmapGrid()

  return (
    <div id="activity" className="space-y-4 sm:space-y-6">
      {/* Streak Stats */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-700/30 hover:scale-105 transition-transform duration-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-orange-400">{dailyStreak?.current || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400">Day Streak</div>
                <div className="text-xs text-slate-500">Best: {dailyStreak?.longest || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 hover:scale-105 transition-transform duration-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-blue-400">{weeklyStreak?.current || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400">Week Streak</div>
                <div className="text-xs text-slate-500">Best: {weeklyStreak?.longest || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-700/30 hover:scale-105 transition-transform duration-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-green-400">{overallStats?.totalTests || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400">Total Tests</div>
                <div className="text-xs text-slate-500">{overallStats?.totalDaysActive || 0} active days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-700/30 hover:scale-105 transition-transform duration-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-yellow-500/20 rounded-lg">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-yellow-400">{achievements?.length || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400">Achievements</div>
                <div className="text-xs text-slate-500">Unlocked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Activity Heatmap */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
            Test Activity Heatmap
          </CardTitle>
          <p className="text-xs sm:text-sm text-slate-400">
            {overallStats?.totalTests || 0} tests completed in the last year
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Month labels */}
            <div className="hidden sm:flex justify-between text-xs text-slate-500 px-4">
              {getMonthLabels().map((month, index) => (
                <span key={index}>{month}</span>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1 overflow-x-auto pb-2">
              {/* Day labels */}
              <div className="flex flex-col gap-1 text-xs text-slate-500 pr-2 flex-shrink-0">
                {getDayLabels().map((day, index) => (
                  <div key={index} className="h-2.5 sm:h-3 flex items-center text-xs">
                    {day}
                  </div>
                ))}
              </div>

              {/* Heatmap cells */}
              <div className="flex gap-1">
                {heatmapGrid.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 border ${getActivityColor(day.level)}`}
                        title={`${formatDate(day.date)}: ${getActivityText(day.count)}`}
                        onClick={() => setSelectedDate(day)}
                        onMouseEnter={() => setHoveredCell(day)}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend and stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border ${getActivityColor(level)}`}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>

              <div className="text-xs text-slate-500">
                Average: {overallStats?.averageTestsPerDay?.toFixed(1) || "0.0"} tests/day
              </div>
            </div>

            {/* Statistics like LeetCode */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-700/30">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-200">{overallStats?.totalTests || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400">tests solved for all time</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-200">{yearlyStats?.testsCompleted || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400">tests solved for the last year</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-200">{monthlyStats?.tests || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400">tests solved for the last month</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-200">{dailyStreak?.longest || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400">days in a row max</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-200">{yearlyStats?.daysActive || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400">days in a row for the last year</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-200">{monthlyStats?.tests || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400">days in a row for the last month</div>
              </div>
            </div>
          </div>

          {/* Selected date details */}
          {selectedDate && (
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <h4 className="font-medium text-slate-200 mb-2">{formatDate(selectedDate.date)}</h4>
              <p className="text-sm text-slate-400 mb-2">{getActivityText(selectedDate.count)} completed</p>
              {selectedDate.count > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>Sample Test</span>
                    <span>85%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {achievements && achievements.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {achievements.slice(-6).map((achievement, index) => (
                <div
                  key={index}
                  className="p-3 sm:p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-700/30 hover:scale-105 transition-transform duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl sm:text-2xl">🏆</div>
                    <div>
                      <div className="font-medium text-yellow-400 text-sm sm:text-base">{achievement}</div>
                      <div className="text-xs text-slate-400">Achievement unlocked</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
