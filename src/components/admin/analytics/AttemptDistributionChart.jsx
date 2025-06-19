"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { BarChart3, Info, Users, Target, TrendingUp } from "lucide-react"

export default function AttemptDistributionChart({ data }) {
  const [showInfo, setShowInfo] = useState(false)
  const [activeIndex, setActiveIndex] = useState(null)

  // No data handling
  if (!data || !data.attemptDistribution || data.attemptDistribution.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">User Engagement Distribution</h3>
                <p className="text-sm text-slate-400 font-normal">Tests vs attempt patterns</p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[320px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg">No engagement data available</p>
              <p className="text-slate-500 text-sm mt-1">User attempt patterns will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total users and engagement metrics
  const totalUsers = data.attemptDistribution.reduce((sum, item) => sum + item.userCount, 0)
  const activeUsers = data.attemptDistribution
    .filter((item) => item.attemptCount > 0)
    .reduce((sum, item) => sum + item.userCount, 0)
  const engagementRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0

  // Color scheme for bars
  const userCountColors = ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"]
  const avgScoreColors = ["#10b981", "#059669", "#047857", "#065f46", "#064e3b"]

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const userCount = payload.find((p) => p.dataKey === "userCount")?.value || 0
      const avgScore = payload.find((p) => p.dataKey === "avgScore")?.value || 0

      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 p-4 rounded-xl shadow-2xl min-w-[200px]">
          <div className="text-slate-200 font-semibold mb-3 pb-2 border-b border-slate-600">
            {label === 0 ? "No Tests Attempted" : `${label} Test${label > 1 ? "s" : ""} Attempted`}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-slate-300">Users:</span>
              </div>
              <span className="font-semibold text-blue-400">{userCount}</span>
            </div>

            {avgScore > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-teal-400" />
                  <span className="text-sm text-slate-300">Avg Score:</span>
                </div>
                <span className="font-semibold text-teal-400">{avgScore.toFixed(1)}%</span>
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-slate-600">
              <div className="text-xs text-slate-400">
                {((userCount / totalUsers) * 100).toFixed(1)}% of total users
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">User Engagement Distribution</h3>
              <p className="text-sm text-slate-400 font-normal">Tests vs attempt patterns</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Engagement Rate</div>
              <div className="text-sm font-semibold text-teal-400">{engagementRate}%</div>
            </div>
            <div className="relative">
              <Info
                className="h-5 w-5 text-slate-400 cursor-pointer hover:text-blue-400 transition-colors duration-200"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
              />
              {showInfo && (
                <div className="absolute right-0 top-8 bg-slate-800/95 backdrop-blur-sm border border-slate-600 p-4 rounded-xl shadow-2xl z-20 w-80">
                  <p className="text-sm text-slate-200 font-medium mb-2">Engagement Analysis</p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    This chart shows the distribution of users based on how many tests they have attempted, along with
                    their average performance scores.
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Users:</span>
                      <span className="text-slate-200 font-medium">{totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Users:</span>
                      <span className="text-teal-400 font-medium">{activeUsers}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-20 mt-10">
          <div className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-400">Total Users</span>
            </div>
            <div className="text-lg font-bold text-slate-200">{totalUsers}</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-teal-400" />
              <span className="text-xs text-slate-400">Active Users</span>
            </div>
            <div className="text-lg font-bold text-teal-400">{activeUsers}</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-slate-400">Engagement</span>
            </div>
            <div className="text-lg font-bold text-purple-400">{engagementRate}%</div>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.attemptDistribution}
              margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
              onMouseEnter={(data, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="attemptCount"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                label={{
                  value: "Number of Tests Attempted",
                  position: "insideBottom",
                  offset: -20,
                  fill: "#94a3b8",
                  fontSize: 12,
                }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                yAxisId="left"
                label={{
                  value: "Number of Users",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#94a3b8",
                  style: { textAnchor: "middle" },
                  fontSize: 12,
                }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                label={{
                  value: "Average Score (%)",
                  angle: 90,
                  position: "insideRight",
                  fill: "#94a3b8",
                  style: { textAnchor: "middle" },
                  fontSize: 12,
                }}
              />
              <Tooltip content={<CustomTooltip />}cursor={{ fill: "rgba(29, 40, 58, 1)" }} />
              <Legend
                wrapperStyle={{ paddingTop: 25 }}
                formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
              />
              <Bar
                dataKey="userCount"
                name="Number of Users"
                yAxisId="left"
                radius={[6, 6, 0, 0]}
                stroke="#1e40af"
                strokeWidth={1}
              >
                {data.attemptDistribution.map((entry, index) => (
                  <Cell
                    key={`user-cell-${index}`}
                    fill={userCountColors[index % userCountColors.length]}
                    opacity={activeIndex === index ? 1 : 0.8}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="avgScore"
                name="Average Score"
                yAxisId="right"
                radius={[6, 6, 0, 0]}
                stroke="#047857"
                strokeWidth={1}
              >
                {data.attemptDistribution.map((entry, index) => (
                  <Cell
                    key={`score-cell-${index}`}
                    fill={avgScoreColors[index % avgScoreColors.length]}
                    opacity={activeIndex === index ? 1 : 0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
