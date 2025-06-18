"use client"

import { useState, useEffect } from "react"
import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"
import { Activity, Calendar } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

const ActivityHeatmap = ({ studentId, isAdminView = false }) => {
  const [streakData, setStreakData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hoveredCell, setHoveredCell] = useState(null)

  useEffect(() => {
    if (studentId || !isAdminView) {
      fetchStreakData()
    }
  }, [studentId, isAdminView])

  const fetchStreakData = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required")
        return
      }

      console.log("🔍 Fetching streak data for student:", studentId)

      // Build URL - if admin viewing student data, add studentId parameter
      const url = isAdminView && studentId ? `/api/student/streak?studentId=${studentId}` : "/api/student/streak"

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Streak data received:", result.data)
        setStreakData(result.data)
      } else {
        const errorData = await response.json()
        console.error("❌ Streak fetch failed:", response.status, errorData)
        setError(errorData.error || "Failed to fetch streak data")
      }
    } catch (error) {
      console.error("❌ Streak fetch error:", error)
      setError("Failed to fetch streak data")
    } finally {
      setLoading(false)
    }
  }

  // Generate heatmap data for the past year
  const generateHeatmapData = () => {
    if (!streakData?.heatmapData) {
      // Generate empty data for past 365 days
      const data = []
      const today = new Date()

      for (let i = 364; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        data.push({
          date: dateStr,
          count: 0,
          totalScore: 0,
          timeSpent: 0,
          averageScore: 0,
          subjects: { Physics: 0, Chemistry: 0, Mathematics: 0 },
        })
      }
      return data
    }

    return streakData.heatmapData.map((item) => ({
      date: item.date,
      count: item.count || 0,
      totalScore: item.totalScore || 0,
      timeSpent: item.timeSpent || 0,
      averageScore: item.averageScore || 0,
      subjects: item.subjects || { Physics: 0, Chemistry: 0, Mathematics: 0 },
    }))
  }

  const heatmapData = generateHeatmapData()

  // Calculate date range for heatmap
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 364) // Past 365 days

  // Custom class for heatmap values
  const classForValue = (value) => {
    if (!value || value.count === 0) {
      return "color-empty"
    } else if (value.count === 1) {
      return "color-github-1"
    } else if (value.count <= 3) {
      return "color-github-2"
    } else if (value.count <= 5) {
      return "color-github-3"
    } else {
      return "color-github-4"
    }
  }

  // Format date for display
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format numbers for display
  const formatNumber = (num) => {
    return num?.toFixed ? num.toFixed(1) : num || 0
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-3">
            <Activity className="h-6 w-6 text-teal-400" />
            Activity & Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-700/30 rounded-lg p-4 h-20"></div>
              ))}
            </div>
            <div className="bg-slate-700/20 rounded-lg p-8 h-40 flex items-center justify-center">
              <div className="text-slate-400">Loading activity data...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-3">
            <Activity className="h-6 w-6 text-teal-400" />
            Activity & Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">Error Loading Data</h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <button
              onClick={fetchStreakData}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { overallStats, yearlyStats, monthlyStats, dailyStreak } = streakData || {}

  return (
    <div className="relative">
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-3">
            <Activity className="h-6 w-6 text-teal-400" />
            Activity & Streaks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity Heatmap */}
          <div className="bg-slate-700/20 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-400" />
                Activity Heatmap
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                {yearlyStats?.testsCompleted || 0} tests completed in the last year
              </p>
            </div>

            {/* Heatmap Container */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px] relative">
                <CalendarHeatmap
                  startDate={startDate}
                  endDate={endDate}
                  values={heatmapData}
                  classForValue={classForValue}
                  onMouseOver={(event, value) => {
                    if (value && value.date) {
                      setHoveredCell({
                        x: event.clientX,
                        y: event.clientY,
                        count: value.count || 0,
                        date: value.date,
                        averageScore: value.averageScore || 0,
                        timeSpent: value.timeSpent || 0,
                        subjects: value.subjects || { Physics: 0, Chemistry: 0, Mathematics: 0 },
                      })
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredCell(null)
                  }}
                  showWeekdayLabels={true}
                  showMonthLabels={true}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-slate-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
              </div>
              <span>More</span>
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
              <div className="text-xl sm:text-2xl font-bold text-slate-200">
                {overallStats?.maxConsecutiveAllTime || dailyStreak?.longest || 0}
              </div>
              <div className="text-xs sm:text-sm text-slate-400">days in a row max</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-200">
                {overallStats?.maxConsecutiveYearly || 0}
              </div>
              <div className="text-xs sm:text-sm text-slate-400">days in a row for the last year</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-200">
                {overallStats?.maxConsecutiveMonthly || 0}
              </div>
              <div className="text-xs sm:text-sm text-slate-400">days in a row for the last month</div>
            </div>
          </div>
        </CardContent>

        {/* Custom CSS for heatmap colors */}
        <style jsx global>{`
          .react-calendar-heatmap .color-empty {
            fill: rgb(71, 85, 105);
          }
          .react-calendar-heatmap .color-github-1 {
            fill: rgb(34, 197, 94);
            opacity: 0.3;
          }
          .react-calendar-heatmap .color-github-2 {
            fill: rgb(34, 197, 94);
            opacity: 0.5;
          }
          .react-calendar-heatmap .color-github-3 {
            fill: rgb(34, 197, 94);
            opacity: 0.7;
          }
          .react-calendar-heatmap .color-github-4 {
            fill: rgb(34, 197, 94);
            opacity: 1;
          }
          .react-calendar-heatmap text {
            fill: rgb(148, 163, 184);
            font-size: 10px;
          }
          .react-calendar-heatmap .month-label {
            font-size: 12px;
          }
          .react-calendar-heatmap .day-label {
            font-size: 10px;
          }
          .react-calendar-heatmap rect {
            cursor: pointer;
          }
          .react-calendar-heatmap rect:hover {
            stroke: rgb(148, 163, 184);
            stroke-width: 1px;
          }
        `}</style>
      </Card>

      {/* Custom Hover Tooltip */}
      {hoveredCell && (
        <div
          style={{
            position: "fixed",
            left: hoveredCell.x + 10,
            top: hoveredCell.y - 10,
            zIndex: 1000,
            pointerEvents: "none",
          }}
          className="bg-slate-900/95 text-white text-sm rounded-lg p-3 border border-slate-600 shadow-xl transform -translate-y-full"
        >
          <div className="font-medium text-slate-200 mb-1">{formatDate(hoveredCell.date)}</div>

          {hoveredCell.count === 0 ? (
            <div className="text-slate-400">No tests completed</div>
          ) : (
            <div className="space-y-1">
              <div className="text-green-400 font-medium">
                <span className="font-bold">{hoveredCell.count}</span> test{hoveredCell.count !== 1 ? "s" : ""}{" "}
                attempted
              </div>

              {/* {hoveredCell.averageScore > 0 && (
                <div className="text-blue-400 text-xs">Average Score: {hoveredCell.averageScore}%</div>
              )} */}

              {/* {hoveredCell.timeSpent > 0 && (
                <div className="text-purple-400 text-xs">
                  Time Spent:{" "}
                  {hoveredCell.timeSpent >= 60
                    ? `${Math.floor(hoveredCell.timeSpent / 60)}h ${hoveredCell.timeSpent % 60}m`
                    : `${hoveredCell.timeSpent}m`}
                </div>
              )} */}

              {/* {hoveredCell.subjects && Object.values(hoveredCell.subjects).some((count) => count > 0) && (
                <div className="text-slate-300 text-xs border-t border-slate-600 pt-1 mt-1">
                  <div className="text-slate-400 mb-1">Subjects:</div>
                  {Object.entries(hoveredCell.subjects)
                    .filter(([_, count]) => count > 0)
                    .map(([subject, count]) => (
                      <div key={subject} className="flex justify-between">
                        <span>{subject}:</span>
                        <span>{count}</span>
                      </div>
                    ))}
                </div>
              )} */}
            </div>
          )}

          {/* Tooltip Arrow */}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95"></div>
        </div>
      )}
    </div>
  )
}

export default ActivityHeatmap
