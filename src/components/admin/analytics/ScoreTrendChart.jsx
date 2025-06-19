"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Info, TrendingUp, Filter } from "lucide-react"

export default function ScoreTrendChart({ data, timeRange }) {
  const [showInfo, setShowInfo] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState("all")

  // No data handling
  if (!data || !data.scoreTrends || data.scoreTrends.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Average Score Trends</h3>
                <p className="text-sm text-slate-400 font-normal">Performance over time</p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[320px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg">No score trend data available</p>
              <p className="text-slate-500 text-sm mt-1">for the selected time range</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter data based on selected subject
  const chartData = selectedSubject === "all" ? data.scoreTrends : data.subjectScoreTrends?.[selectedSubject] || []

  // Get available subjects from data
  const subjects = ["all", ...(data.availableSubjects || [])]

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 p-4 rounded-xl shadow-2xl">
          <p className="text-slate-200 font-semibold mb-2">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-slate-300">
                {`${entry.name}: `}
                <span className="font-semibold" style={{ color: entry.color }}>
                  {entry.value.toFixed(1)}%
                </span>
              </span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-600">
            <p className="text-xs text-slate-400">{`${payload[0].payload.attemptCount || 0} attempts`}</p>
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
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Average Score Trends</h3>
              <p className="text-sm text-slate-400 font-normal">Performance over time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-700/80 border border-slate-600 text-slate-200 text-sm rounded-lg pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 min-w-[140px]"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject} className="bg-slate-800">
                    {subject === "all" ? "All Subjects" : subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Info
                className="h-5 w-5 text-slate-400 cursor-pointer hover:text-teal-400 transition-colors duration-200"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
              />
              {showInfo && (
                <div className="absolute right-0 top-8 bg-slate-800/95 backdrop-blur-sm border border-slate-600 p-4 rounded-xl shadow-2xl z-20 w-72">
                  <p className="text-sm text-slate-200 font-medium mb-2">Score Trends Analysis</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This chart shows the average test scores over time. You can filter by subject to see specific
                    performance trends. The green line shows average scores while the blue line shows median scores.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 15 }}
                iconType="line"
                formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                name="Average Score"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, fill: "#0f172a", stroke: "#10b981" }}
                activeDot={{ r: 7, strokeWidth: 2, fill: "#10b981", stroke: "#0f172a" }}
              />
              {selectedSubject === "all" && (
                <Line
                  type="monotone"
                  dataKey="medianScore"
                  name="Median Score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: "#0f172a", stroke: "#3b82f6" }}
                  activeDot={{ r: 7, strokeWidth: 2, fill: "#3b82f6", stroke: "#0f172a" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
