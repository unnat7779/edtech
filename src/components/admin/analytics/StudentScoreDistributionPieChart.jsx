"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { PieChart, Users, TrendingUp } from "lucide-react"

export default function StudentScoreDistributionPieChart({ timeRange = "30d" }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetchScoreDistribution()
  }, [timeRange])

  const fetchScoreDistribution = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/admin/analytics/score-distribution?period=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Score distribution data:", result.data)
        setData(result.data)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch score distribution")
      }
    } catch (error) {
      console.error("Error fetching score distribution:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMouseMove = (event, segment) => {
    setHoveredSegment(segment)
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredSegment(null)
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-400" />
            Student Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-800 border-t-purple-400 mb-4"></div>
            <div className="text-slate-400">Loading score distribution...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-400" />
            Student Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-16 w-16 text-red-400 mb-4" />
            <div className="text-red-400 text-center">
              <p className="font-medium mb-2">Error Loading Data</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.scoreRanges || data.scoreRanges.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-400" />
            Student Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-slate-400 mb-4" />
            <div className="text-slate-400 text-center">
              <p className="font-medium mb-2">No Score Data Available</p>
              <p className="text-sm text-slate-500">
                Student score distribution will appear here once tests are completed
              </p>
              <p className="text-xs text-slate-600 mt-2">Total attempts found: {data?.totalAttempts || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate pie chart segments
  const total = data.scoreRanges.reduce((sum, range) => sum + range.students, 0)
  let currentAngle = 0

  const segments = data.scoreRanges.map((range, index) => {
    const percentage = (range.students / total) * 100
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle += angle

    // Calculate path for pie segment
    const centerX = 120
    const centerY = 120
    const radius = 100

    // For a full circle (100%), draw a complete circle instead of a path
    if (percentage >= 99.9) {
      return {
        ...range,
        percentage: percentage.toFixed(1),
        pathData: null, // Will render as full circle
        isFullCircle: true,
        startAngle,
        endAngle,
      }
    }

    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180

    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ")

    return {
      ...range,
      percentage: percentage.toFixed(1),
      pathData,
      isFullCircle: false,
      startAngle,
      endAngle,
    }
  })

  const getPerformanceLabel = (range) => {
    const labels = {
      "0-90": "Poor (0-30%)",
      "91-150": "Below Average (31-50%)",
      "151-210": "Average (51-70%)",
      "211-270": "Good (71-90%)",
      "271-300": "Excellent (91-100%)",
    }
    return labels[range] || range
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-400" />
          Student Score Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Pie Chart */}
          <div className="relative">
            <svg width="240" height="240" className="drop-shadow-lg">
              {segments.map((segment, index) =>
                segment.isFullCircle ? (
                  // Render full circle for 100% segments
                  <circle
                    key={index}
                    cx="120"
                    cy="120"
                    r="100"
                    fill={segment.color}
                    stroke="#1e293b"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                    style={{
                      filter: hoveredSegment?.range === segment.range ? "brightness(1.2)" : "brightness(1)",
                      transform: hoveredSegment?.range === segment.range ? "scale(1.05)" : "scale(1)",
                      transformOrigin: "120px 120px",
                    }}
                    onMouseMove={(e) => handleMouseMove(e, segment)}
                    onMouseLeave={handleMouseLeave}
                  />
                ) : (
                  // Render path for partial segments
                  <path
                    key={index}
                    d={segment.pathData}
                    fill={segment.color}
                    stroke="#1e293b"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                    style={{
                      filter: hoveredSegment?.range === segment.range ? "brightness(1.2)" : "brightness(1)",
                      transform: hoveredSegment?.range === segment.range ? "scale(1.05)" : "scale(1)",
                      transformOrigin: "120px 120px",
                    }}
                    onMouseMove={(e) => handleMouseMove(e, segment)}
                    onMouseLeave={handleMouseLeave}
                  />
                ),
              )}
              {/* Center circle for donut effect */}
              <circle cx="120" cy="120" r="40" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              {/* Center text */}
              <text x="120" y="115" textAnchor="middle" className="fill-slate-200 text-sm font-semibold">
                {data.totalStudents}
              </text>
              <text x="120" y="130" textAnchor="middle" className="fill-slate-400 text-xs">
                Students
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/30 hover:border-slate-500/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.color }}></div>
                  <div>
                    <div className="text-slate-200 font-medium text-sm">{getPerformanceLabel(segment.range)}</div>
                    <div className="text-slate-400 text-xs">
                      {segment.minMarks}-{segment.maxMarks} marks ({segment.percentage}%)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-200 font-semibold">{segment.students}</div>
                  <div className="text-slate-400 text-xs">{segment.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-200">{data.totalStudents}</div>
              <div className="text-sm text-slate-400">Total Students</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">{data.averageScore}</div>
              <div className="text-sm text-slate-400">Avg Score (out of 300)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200">{data.totalAttempts}</div>
              <div className="text-sm text-slate-400">Total Attempts</div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Tooltip */}
      {hoveredSegment && (
        <div
          className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <div className="text-slate-200 font-semibold mb-1">{getPerformanceLabel(hoveredSegment.range)}</div>
          <div className="text-slate-300 text-sm space-y-1">
            <div>📊 Score Range: {hoveredSegment.percentage}</div>
            <div>
              📝 Marks: {hoveredSegment.minMarks}-{hoveredSegment.maxMarks} out of 300
            </div>
            <div>👥 Students: {hoveredSegment.students}</div>
            <div>📈 Percentage: {hoveredSegment.percentage}% of total</div>
          </div>
        </div>
      )}
    </Card>
  )
}
