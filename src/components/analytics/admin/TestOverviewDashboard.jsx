"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Users, Clock, TrendingUp, Award, Target, AlertTriangle, CheckCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

export default function TestOverviewDashboard({ testData, analyticsData, filters }) {
  // Mock data - replace with actual analytics data
  const kpiData = {
    totalAttempts: analyticsData?.totalAttempts || 1247,
    completedAttempts: analyticsData?.completedAttempts || 1089,
    averageScore: analyticsData?.averageScore || 72.5,
    completionRate: analyticsData?.completionRate || 87.3,
    averageTime: analyticsData?.averageTime || 142, // minutes
    topScore: analyticsData?.topScore || 295,
  }

  const participationFunnel = [
    { stage: "Registered", count: 1500, percentage: 100, color: "#3b82f6" },
    { stage: "Started", count: 1247, percentage: 83.1, color: "#10b981" },
    { stage: "Completed", count: 1089, percentage: 72.6, color: "#f59e0b" },
    { stage: "Submitted", count: 1089, percentage: 72.6, color: "#8b5cf6" },
  ]

  const scoreDistribution = [
    { range: "0-20", count: 45, percentage: 4.1 },
    { range: "21-40", count: 123, percentage: 11.3 },
    { range: "41-60", count: 287, percentage: 26.4 },
    { range: "61-80", count: 398, percentage: 36.5 },
    { range: "81-100", count: 236, percentage: 21.7 },
  ]

  const timeAnalysis = [
    { timeRange: "0-60 min", count: 156, avgScore: 45.2 },
    { timeRange: "61-120 min", count: 423, avgScore: 68.7 },
    { timeRange: "121-180 min", count: 387, avgScore: 78.9 },
    { timeRange: "181-240 min", count: 123, avgScore: 82.1 },
  ]

  const dailyAttempts = [
    { date: "2024-01-15", attempts: 45, completed: 38 },
    { date: "2024-01-16", attempts: 67, completed: 59 },
    { date: "2024-01-17", attempts: 89, completed: 76 },
    { date: "2024-01-18", attempts: 123, completed: 108 },
    { date: "2024-01-19", attempts: 156, completed: 142 },
    { date: "2024-01-20", attempts: 134, completed: 119 },
    { date: "2024-01-21", attempts: 98, completed: 87 },
  ]

  const subjectPerformance = [
    { subject: "Physics", avgScore: 68.5, attempts: 1089, difficulty: 7.2 },
    { subject: "Chemistry", avgScore: 71.8, attempts: 1089, difficulty: 6.8 },
    { subject: "Mathematics", avgScore: 77.2, attempts: 1089, difficulty: 6.5 },
  ]

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
                <p className="text-blue-400 text-sm font-medium">Total Attempts</p>
                <p className="text-3xl font-bold text-white">{kpiData.totalAttempts.toLocaleString()}</p>
                <p className="text-blue-300 text-xs mt-1">
                  +{Math.round((kpiData.totalAttempts / 1000) * 12)}% from last test
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-white">{kpiData.completionRate}%</p>
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
                <p className="text-yellow-400 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-white">{kpiData.averageScore}%</p>
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
                <p className="text-purple-400 text-sm font-medium">Avg Time</p>
                <p className="text-3xl font-bold text-white">
                  {Math.floor(kpiData.averageTime / 60)}h {kpiData.averageTime % 60}m
                </p>
                <p className="text-purple-300 text-xs mt-1">Per attempt</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participation Funnel & Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-200">
              <TrendingUp className="h-6 w-6 text-green-400" />
              Participation Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {participationFunnel.map((stage, index) => (
                <div key={index} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300 font-medium">{stage.stage}</span>
                    <div className="text-right">
                      <span className="text-slate-200 font-semibold">{stage.count.toLocaleString()}</span>
                      <span className="text-slate-400 text-sm ml-2">({stage.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${stage.percentage}%`,
                        backgroundColor: stage.color,
                      }}
                    ></div>
                  </div>
                  {index < participationFunnel.length - 1 && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-600"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Daily Attempts Trend */}
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
              <AreaChart data={dailyAttempts}>
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
                  dataKey="attempts"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Total Attempts"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
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

      {/* Time vs Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-200">
              <Clock className="h-6 w-6 text-purple-400" />
              Time vs Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="timeRange" tick={{ fill: "#9ca3af" }} />
                  <YAxis yAxisId="left" tick={{ fill: "#9ca3af" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar yAxisId="left" dataKey="count" fill="#8b5cf6" name="Students" />
                  <Bar yAxisId="right" dataKey="avgScore" fill="#f59e0b" name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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
                      <div className="text-lg font-bold" style={{ color: getScoreColor(subject.avgScore) }}>
                        {subject.avgScore}%
                      </div>
                      <div className="text-xs text-slate-400">{subject.attempts} attempts</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${subject.avgScore}%`,
                        backgroundColor: getScoreColor(subject.avgScore),
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Difficulty Rating:</span>
                    <span className="text-slate-300">{subject.difficulty}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Stats */}
      <Card className="bg-gradient-to-br from-teal-900/20 to-blue-900/20 border-teal-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-200">
            <AlertTriangle className="h-6 w-6 text-teal-400" />
            Real-time Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-800/30 rounded-lg">
              <div className="text-2xl font-bold text-teal-400 mb-1">23</div>
              <div className="text-sm text-slate-400">Active Test Takers</div>
              <div className="text-xs text-slate-500 mt-1">Currently taking the test</div>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">156</div>
              <div className="text-sm text-slate-400">Completed Today</div>
              <div className="text-xs text-slate-500 mt-1">+12% from yesterday</div>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400 mb-1">4.2</div>
              <div className="text-sm text-slate-400">Avg Rating</div>
              <div className="text-xs text-slate-500 mt-1">Based on 89 reviews</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
