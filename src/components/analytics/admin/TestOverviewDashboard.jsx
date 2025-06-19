"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Users, Clock, TrendingUp, Award, Target, AlertTriangle, CheckCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

export default function TestOverviewDashboard({ testData, analyticsData, filters }) {
  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  const kpiData = {
    totalAttempts: analyticsData.totalAttempts || 0,
    completedAttempts: analyticsData.completedAttempts || 0,
    averageScore: analyticsData.averageScore || 0,
    completionRate: analyticsData.completionRate || 0,
    averageTime: analyticsData.averageTime || 0,
    topScore: analyticsData.topScore || 0,
  }

  const scoreDistribution = analyticsData.scoreDistribution || []
  const dailyTrends = analyticsData.dailyTrends || []
  const subjectPerformance = analyticsData.subjectPerformance || []
  const timeAnalysis = analyticsData.timeAnalysis || []

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"
    if (score >= 60) return "#f59e0b"
    return "#ef4444"
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm mt-6 font-medium">Total Attempts</p>
                <p className="text-3xl font-bold text-white">{kpiData.totalAttempts.toLocaleString()}</p>
                <p className="text-blue-300 text-xs mt-1">{kpiData.completedAttempts} completed</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm mt-6 font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-white">{kpiData.completionRate.toFixed(1)}%</p>
                <p className="text-green-300 text-xs mt-1">{kpiData.completedAttempts} completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm mt-6 font-medium">Average Score</p>
                <p className="text-3xl font-bold text-white">{kpiData.averageScore.toFixed(1)}%</p>
                <p className="text-yellow-300 text-xs mt-1">Top: {kpiData.topScore}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm mt-6 font-medium">Avg Time</p>
                <p className="text-3xl font-bold text-white">
                  {Math.floor(kpiData.averageTime / 60)}h {Math.floor(kpiData.averageTime % 60)}m
                </p>
                <p className="text-purple-300 text-xs mt-1">Per attempt</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      {scoreDistribution.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-200">
              <BarChart className="h-6 w-6 text-blue-400" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" tick={{ fill: "#9ca3af" }} />
                  <YAxis tick={{ fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Attempts Trend */}
      {dailyTrends.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-200">
              <TrendingUp className="h-6 w-6 text-teal-400" />
              Daily Attempts Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af" }} />
                  <YAxis tick={{ fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalAttempts"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Total Attempts"
                  />
                  <Area
                    type="monotone"
                    dataKey="completedAttempts"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Performance Overview */}
      {subjectPerformance.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-200">
              <Target className="h-6 w-6 text-yellow-400" />
              Subject Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.map((subject, index) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-slate-200">{subject.subject}</h4>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: getScoreColor(subject.averageScore) }}>
                        {subject.averageScore.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">{subject.totalQuestions} questions</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${subject.averageScore}%`,
                        backgroundColor: getScoreColor(subject.averageScore),
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Accuracy:</span>
                    <span className="text-slate-300">{subject.accuracy.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {/* {analyticsData.insights && analyticsData.insights.length > 0 && (
        <Card className="bg-gradient-to-br from-teal-900/20 to-blue-900/20 border-teal-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-200">
              <AlertTriangle className="h-6 w-6 text-teal-400" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.insights.map((insight, index) => (
                <div key={index} className="p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        insight.type === "success"
                          ? "bg-green-400"
                          : insight.type === "warning"
                            ? "bg-yellow-400"
                            : insight.type === "alert"
                              ? "bg-red-400"
                              : "bg-blue-400"
                      }`}
                    ></div>
                    <div>
                      <h4 className="font-medium text-slate-200">{insight.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  )
}
