"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Calendar, RefreshCw } from "lucide-react"
import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"

export default function AdminActivityHeatmap({ studentId }) {
  const [streakData, setStreakData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [hoveredCell, setHoveredCell] = useState(null)

  useEffect(() => {
    if (studentId) {
      fetchStreakData()
    }
  }, [studentId])

  const fetchStreakData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      console.log("🔍 Admin fetching activity streaks for student:", studentId)

      const response = await fetch(`/api/admin/analytics/students/${studentId}/activity-streaks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Admin API Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Admin API Error response:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log("📊 Admin API Response data:", result)

      if (result.success) {
        setStreakData(result.data)
        console.log("✅ Admin streak data loaded successfully")
      } else {
        throw new Error(result.error || "Failed to load streak data")
      }
    } catch (error) {
      console.error("❌ Error fetching admin streak data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getActivityColor = (count) => {
    if (count === 0) return "color-empty"
    if (count === 1) return "color-scale-1"
    if (count <= 3) return "color-scale-2"
    if (count <= 5) return "color-scale-3"
    return "color-scale-4"
  }

  const getActivityText = (count) => {
    if (count === 0) return "No tests"
    if (count === 1) return "1 test"
    return `${count} tests`
  }

  const formatHeatmapData = () => {
    if (!streakData?.heatmapData) return []

    return streakData.heatmapData.map((day) => ({
      date: day.date,
      count: day.count,
      averageScore: day.averageScore,
      timeSpent: day.timeSpent,
      subjects: day.subjects,
    }))
  }

  const calculateAverageTestsPerDay = () => {
    if (!streakData?.heatmapData) return 0

    const activeDays = streakData.heatmapData.filter((day) => day.count > 0).length
    const totalTests = streakData.heatmapData.reduce((sum, day) => sum + day.count, 0)

    return activeDays > 0 ? (totalTests / activeDays).toFixed(1) : "0.0"
  }

  const handleDayClick = (value) => {
    if (value && value.count > 0) {
      setSelectedDate(value)
    } else {
      setSelectedDate(null)
    }
  }

  const handleDayHover = (event, value) => {
    if (value && value.count > 0) {
      setHoveredCell({
        x: event.clientX,
        y: event.clientY,
        ...value,
      })
    } else {
      setHoveredCell(null)
    }
  }

  const handleDayLeave = () => {
    setHoveredCell(null)
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
                <span className="ml-2 text-slate-400">Loading student activity data...</span>
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
                <p className="font-medium">Error loading student activity data</p>
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
              <p>No activity data available for this student</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Extract data from the admin API response structure
  const heatmapData = formatHeatmapData()
  const dailyStreak = streakData.dailyStreak || { current: 0, longest: 0 }
  const overallStats = streakData.overallStats || {}
  const yearlyStats = streakData.yearlyStats || {}
  const monthlyStats = streakData.monthlyStats || {}

  // Calculate date ranges for the heatmap
  const endDate = new Date()
  const startDate = new Date()
  startDate.setFullYear(endDate.getFullYear() - 1)

  return (
    <div id="activity" className="space-y-4 sm:space-y-6">
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
            Student Test Activity Heatmap
          </CardTitle>
          <p className="text-xs sm:text-sm text-slate-400">
            {yearlyStats?.testsCompleted || 0} tests completed in the last year
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Calendar Heatmap */}
            <div className="react-calendar-heatmap-wrapper">
              <style jsx global>{`
                .react-calendar-heatmap {
                  font-size: 0.8rem;
                }
                .react-calendar-heatmap text {
                  fill: #94a3b8;
                  font-size: 0.6rem;
                }
                .react-calendar-heatmap .react-calendar-heatmap-small-text {
                  font-size: 0.5rem;
                }
                .react-calendar-heatmap rect {
                  rx: 2;
                  stroke: rgba(30, 41, 59, 0.5);
                  stroke-width: 1;
                }
                .react-calendar-heatmap .color-empty {
                  fill: rgba(30, 41, 59, 0.3);
                }
                .react-calendar-heatmap .color-scale-1 {
                  fill: rgba(74, 222, 128, 0.4);
                }
                .react-calendar-heatmap .color-scale-2 {
                  fill: rgba(74, 222, 128, 0.6);
                }
                .react-calendar-heatmap .color-scale-3 {
                  fill: rgba(74, 222, 128, 0.8);
                }
                .react-calendar-heatmap .color-scale-4 {
                  fill: rgba(74, 222, 128, 1);
                }
                .tooltip {
                  position: fixed;
                  background-color: rgba(15, 23, 42, 0.9);
                  border: 1px solid rgba(74, 222, 128, 0.3);
                  border-radius: 6px;
                  padding: 8px 12px;
                  font-size: 0.8rem;
                  color: white;
                  z-index: 1000;
                  pointer-events: none;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
              `}</style>

              <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={heatmapData}
                classForValue={(value) => {
                  if (!value || value.count === 0) {
                    return "color-empty"
                  }
                  return getActivityColor(value.count)
                }}
                tooltipDataAttrs={(value) => {
                  if (!value || !value.date) {
                    return null
                  }
                  return {
                    "data-tip": `${formatDate(value.date)}: ${getActivityText(value.count)}`,
                  }
                }}
                showWeekdayLabels={true}
                onClick={handleDayClick}
                onMouseOver={handleDayHover}
                onMouseLeave={handleDayLeave}
                transformDayElement={(element, value, index) => {
                  if (value && selectedDate && value.date === selectedDate.date) {
                    return React.cloneElement(element, {
                      style: { ...element.props.style, stroke: "#4ade80", strokeWidth: 2 },
                    })
                  }
                  return element
                }}
              />

              {/* Legend */}
              <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-slate-800/30 border border-slate-700/20"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-900/40 border border-green-800/30"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-700/60 border border-green-600/40"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500/80 border border-green-400/50"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-400 border border-green-300/60"></div>
                  </div>
                  <span>More</span>
                </div>
                <div>Average: {calculateAverageTestsPerDay()} tests/day</div>
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
                <div className="text-xl sm:text-2xl font-bold text-slate-200">
                  {yearlyStats?.maxConsecutiveDays || 0}
                </div>
                <div className="text-xs sm:text-sm text-slate-400">days in a row for the last year</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-200">
                  {monthlyStats?.maxConsecutiveDays || 0}
                </div>
                <div className="text-xs sm:text-sm text-slate-400">days in a row for the last month</div>
              </div>
            </div>

            {/* Selected date details */}
            {selectedDate && (
              <div className="mt-2 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <h4 className="font-medium text-slate-200 mb-2">{formatDate(selectedDate.date)}</h4>
                <p className="text-sm text-slate-400 mb-2">{selectedDate.count} tests completed</p>
                <div className="space-y-1">
                  {selectedDate.averageScore > 0 && (
                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>Average Score</span>
                      <span>{selectedDate.averageScore.toFixed(1)}%</span>
                    </div>
                  )}
                  {selectedDate.timeSpent > 0 && (
                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>Time Spent</span>
                      <span>
                        {selectedDate.timeSpent >= 60
                          ? `${Math.floor(selectedDate.timeSpent / 60)} minutes`
                          : `${selectedDate.timeSpent} seconds`}
                      </span>
                    </div>
                  )}
                  {selectedDate.subjects && Object.keys(selectedDate.subjects).length > 0 && (
                    <div className="text-xs text-slate-500">
                      <div className="font-medium mb-1">Subjects:</div>
                      {Object.entries(selectedDate.subjects).map(([subject, count]) => (
                        <div key={subject} className="flex justify-between ml-2">
                          <span>{subject}</span>
                          <span>{count} tests</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom tooltip */}
      {hoveredCell && (
        <div
          className="tooltip"
          style={{
            left: hoveredCell.x + 10,
            top: hoveredCell.y - 40,
          }}
        >
          <div className="font-medium">{formatDate(hoveredCell.date)}</div>
          <div>
            <span className="font-bold">{hoveredCell.count}</span> tests completed
          </div>
          {/* {hoveredCell.averageScore > 0 && (
            <div className="text-green-300">Average Score: {hoveredCell.averageScore.toFixed(1)}%</div>
          )}
          {hoveredCell.timeSpent > 0 && (
            <div className="text-blue-300">
              Time Spent:{" "}
              {hoveredCell.timeSpent >= 60
                ? `${Math.floor(hoveredCell.timeSpent / 60)} minutes`
                : `${hoveredCell.timeSpent} seconds`}
            </div>
          )}
          {hoveredCell.subjects && Object.keys(hoveredCell.subjects).length > 0 && (
            <div className="mt-1 text-yellow-200">
              <div>Subjects:</div>
              {Object.entries(hoveredCell.subjects).map(([subject, count]) => (
                <div key={subject} className="ml-2 flex justify-between">
                  <span>{subject}:</span>
                  <span className="ml-2">{count}</span>
                </div>
              ))}
            </div>
          )} */}
        </div>
      )}
    </div>
  )
}
