"use client"

import { useState, useEffect } from "react"
import { X, TrendingUp, TrendingDown, Calendar, Clock, ExternalLink, BarChart3, Award, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, LineChart, Line } from "recharts"
import { useRouter } from "next/navigation"

export default function ProgressModal({ testId, testTitle, isOpen, onClose }) {
  const router = useRouter()
  const [progressData, setProgressData] = useState([])
  const [improvement, setImprovement] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState("percentage")

  useEffect(() => {
    if (isOpen && testId) {
      fetchProgressData()
    }
  }, [isOpen, testId])

  const fetchProgressData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/test-history/${testId}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setProgressData(data.attempts || [])
        setImprovement(data.improvement || {})
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error("Error fetching progress data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getImprovementColor = (value) => {
    if (value > 0) return "text-emerald-400"
    if (value < 0) return "text-red-400"
    return "text-slate-400"
  }

  const getImprovementIcon = (value) => {
    if (value > 0) return <TrendingUp className="h-4 w-4" />
    if (value < 0) return <TrendingDown className="h-4 w-4" />
    return <div className="h-4 w-4" />
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case "improving":
        return "text-emerald-400"
      case "declining":
        return "text-red-400"
      default:
        return "text-slate-400"
    }
  }

  const getChartData = () => {
    return progressData.map((attempt, index) => ({
      attempt: index + 1,
      score: attempt.score?.obtained || 0,
      percentage: attempt.score?.percentage || 0,
      timeSpent: Math.round((attempt.timeSpent || 0) / 60),
      date: new Date(attempt.createdAt).toLocaleDateString(),
      fullDate: attempt.createdAt,
      physics: attempt.subjectScores?.Physics?.percentage || 0,
      chemistry: attempt.subjectScores?.Chemistry?.percentage || 0,
      mathematics: attempt.subjectScores?.Mathematics?.percentage || 0,
    }))
  }

  const chartData = getChartData()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div>
            <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-teal-400" />
              Progress Analysis
            </h2>
            <p className="text-slate-400 mt-1">{testTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[80vh] p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
              <div className="text-slate-400">Loading progress data...</div>
            </div>
          ) : progressData.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <div className="text-slate-400 text-lg">No progress data available</div>
              <div className="text-slate-500 text-sm mt-2">Take this test multiple times to see your progress</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Improvement Summary Cards */}
              {improvement && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <div className="flex mt-6 items-center justify-center mb-2">
                        {getImprovementIcon(improvement.latestImprovement)}
                      </div>
                      <div className={`text-xl font-bold ${getImprovementColor(improvement.latestImprovement)}`}>
                        {improvement.latestImprovement > 0 ? "+" : ""}
                        {improvement.latestImprovement}%
                      </div>
                      <div className="text-sm text-slate-400">Latest Improvement</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <div className="flex mt-6 items-center justify-center mb-2">
                        {getImprovementIcon(improvement.overallImprovement)}
                      </div>
                      <div className={`text-xl font-bold ${getImprovementColor(improvement.overallImprovement)}`}>
                        {improvement.overallImprovement > 0 ? "+" : ""}
                        {improvement.overallImprovement}%
                      </div>
                      <div className="text-sm text-slate-400">Overall Improvement</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <Award className="h-6 w-6 mt-6 text-yellow-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-yellow-400">{improvement.bestScore}%</div>
                      <div className="text-sm text-slate-400">Best Score</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <Target className="h-6 w-6 mt-6 text-blue-400 mx-auto mb-2" />
                      <div className={`text-xl font-bold ${getTrendColor(improvement.trend)}`}>
                        {improvement.trend.charAt(0).toUpperCase() + improvement.trend.slice(1)}
                      </div>
                      <div className="text-sm text-slate-400">Trend</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Chart Controls */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-sm font-medium text-slate-300">View:</div>
                <div className="flex gap-2">
                  {[
                    { key: "percentage", label: "Overall %" },
                    { key: "score", label: "Raw Score" },
                    { key: "timeSpent", label: "Time Spent" },
                  ].map((metric) => (
                    <button
                      key={metric.key}
                      onClick={() => setSelectedMetric(metric.key)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        selectedMetric === metric.key
                          ? "bg-teal-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Chart */}
              <Card className="bg-slate-700/30 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-slate-200">Progress Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="attempt"
                          tick={{ fill: "#9ca3af" }}
                          label={{ value: "Attempt Number", position: "insideBottom", offset: -5, fill: "#9ca3af" }}
                        />
                        <YAxis
                          tick={{ fill: "#9ca3af" }}
                          label={{
                            value:
                              selectedMetric === "timeSpent"
                                ? "Minutes"
                                : selectedMetric === "score"
                                  ? "Score"
                                  : "Percentage",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#9ca3af",
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#f1f5f9",
                          }}
                          formatter={(value, name) => [
                            selectedMetric === "timeSpent"
                              ? `${value} min`
                              : selectedMetric === "percentage"
                                ? `${value}%`
                                : value,
                            selectedMetric === "timeSpent"
                              ? "Time Spent"
                              : selectedMetric === "score"
                                ? "Score"
                                : "Percentage",
                          ]}
                          labelFormatter={(label) => `Attempt ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey={selectedMetric}
                          stroke="#14b8a6"
                          strokeWidth={3}
                          fill="url(#colorGradient)"
                          dot={{ fill: "#14b8a6", strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: "#14b8a6", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Subject-wise Progress */}
              <Card className="bg-slate-700/30 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-slate-200">Subject-wise Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="attempt" tick={{ fill: "#9ca3af" }} />
                        <YAxis tick={{ fill: "#9ca3af" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Line type="monotone" dataKey="physics" stroke="#ef4444" strokeWidth={2} name="Physics" />
                        <Line type="monotone" dataKey="chemistry" stroke="#3b82f6" strokeWidth={2} name="Chemistry" />
                        <Line
                          type="monotone"
                          dataKey="mathematics"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          name="Mathematics"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Attempt Timeline */}
              {/* <Card className="bg-slate-700/30 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-slate-200">Attempt Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">

                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-600"></div>

                    <div className="space-y-6">
                      {progressData.map((attempt, index) => (
                        <div key={attempt._id} className="relative flex items-start gap-6">

                          <div
                            className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
                            onClick={() => router.push(`/analytics/student/${attempt._id}`)}
                          >
                            <div className="text-white font-bold text-sm">#{index + 1}</div>
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 opacity-20 animate-pulse"></div>
                          </div>


                          <div className="flex-1 bg-slate-800/30 rounded-xl p-6 border border-slate-600/50 hover:border-slate-500/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-slate-200">Attempt #{index + 1}</h4>
                                <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(attempt.createdAt).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(attempt.createdAt).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => router.push(`/analytics/student/${attempt._id}`)}
                                className="flex items-center gap-2 px-3 py-1 bg-teal-600/20 text-teal-400 rounded-lg hover:bg-teal-600/30 transition-colors text-sm"
                              >
                                View Analytics
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>


                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-teal-400">{attempt.score?.obtained || 0}</div>
                                <div className="text-xs text-slate-400">Score</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">
                                  {Math.round(attempt.score?.percentage || 0)}%
                                </div>
                                <div className="text-xs text-slate-400">Percentage</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">
                                  {attempt.analysis?.correct || 0}
                                </div>
                                <div className="text-xs text-slate-400">Correct</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">
                                  {Math.round((attempt.timeSpent || 0) / 60)}m
                                </div>
                                <div className="text-xs text-slate-400">Time</div>
                              </div>
                            </div>


                            {index > 0 && (
                              <div className="mb-4">
                                {(() => {
                                  const currentScore = attempt.score?.percentage || 0
                                  const previousScore = progressData[index - 1]?.score?.percentage || 0
                                  const change = currentScore - previousScore

                                  return (
                                    <div
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                        change > 0
                                          ? "bg-emerald-900/30 text-emerald-400"
                                          : change < 0
                                            ? "bg-red-900/30 text-red-400"
                                            : "bg-slate-700/30 text-slate-400"
                                      }`}
                                    >
                                      <TrendingUp className={`h-3 w-3 ${change < 0 ? "rotate-180" : ""}`} />
                                      {change > 0 ? "+" : ""}
                                      {change.toFixed(1)}% from previous
                                    </div>
                                  )
                                })()}
                              </div>
                            )}


                            {attempt.subjectScores && (
                              <div>
                                <h5 className="text-sm font-medium text-slate-300 mb-2">Subject-wise Performance</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {Object.entries(attempt.subjectScores).map(([subject, data]) => (
                                    <div key={subject} className="bg-slate-800/50 rounded-lg p-3">
                                      <div className="text-sm font-medium text-slate-200 mb-1">{subject}</div>
                                      <div className="text-xs text-slate-400 mb-2">
                                        {data.correct}/{data.correct + data.incorrect + data.unattempted} correct
                                      </div>
                                      <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                          className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500"
                                          style={{ width: `${data.percentage || 0}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card> */}

              {/* Statistics Summary */}
              {/* {stats && (
                <Card className="bg-slate-700/30 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Summary Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{stats.totalAttempts}</div>
                        <div className="text-sm text-slate-400">Total Attempts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{Math.round(stats.averageScore)}%</div>
                        <div className="text-sm text-slate-400">Average Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{Math.round(stats.bestScore)}%</div>
                        <div className="text-sm text-slate-400">Best Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )} */}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
