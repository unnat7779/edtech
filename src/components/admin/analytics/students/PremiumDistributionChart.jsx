"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Crown, DollarSign, Users, TrendingUp } from "lucide-react"

const PLAN_COLORS = {
  "1:1 Mentorship - Silver Plan": "#c0c0c0", // Silver
  "1:1 Mentorship - Gold Plan": "#ffd700", // Gold
  "PCM Chat Doubt Support": "#3b82f6", // Blue
  "PCM Live 1:1 Doubt Support": "#10b981", // Green
}

const PLAN_ICONS = {
  "1:1 Mentorship - Silver Plan": "🥈",
  "1:1 Mentorship - Gold Plan": "🥇",
  "PCM Chat Doubt Support": "💬",
  "PCM Live 1:1 Doubt Support": "📹",
}

export default function PremiumDistributionChart() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState("users") // users or revenue

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/analytics/students/premium-distribution", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        throw new Error("Failed to fetch premium distribution data")
      }
    } catch (error) {
      console.error("Error fetching premium distribution:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="h-80 bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-700/50">
        Error loading premium distribution: {error}
      </div>
    )
  }

  const chartData = data.plans.map((plan) => ({
    ...plan,
    color: PLAN_COLORS[plan.planType] || "#6b7280",
    icon: PLAN_ICONS[plan.planType] || "📊",
    displayValue: viewMode === "users" ? plan.count : plan.revenue,
    displayPercentage: viewMode === "users" ? plan.percentage : plan.revenuePercentage,
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 shadow-lg">
          <p className="text-slate-200 font-medium flex items-center gap-2">
            <span>{data.icon}</span>
            {data.planType}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-slate-300">
              Users: <span className="font-semibold text-white">{data.count}</span>
            </p>
            <p className="text-slate-300">
              Revenue: <span className="font-semibold text-green-400">₹{data.revenue.toLocaleString()}</span>
            </p>
            <p className="text-slate-300">
              User Share: <span className="font-semibold text-blue-400">{data.percentage}%</span>
            </p>
            <p className="text-slate-300">
              Revenue Share: <span className="font-semibold text-amber-400">{data.revenuePercentage}%</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            Premium Plan Distribution
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("users")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "users" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <Users className="h-3 w-3 inline mr-1" />
              Users
            </button>
            <button
              onClick={() => setViewMode("revenue")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "revenue" ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <DollarSign className="h-3 w-3 inline mr-1" />
              Revenue
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="displayValue"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Plan Details */}
          <div className="space-y-4">
            {chartData.map((plan, index) => (
              <div key={index} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{plan.icon}</span>
                    <span className="text-slate-200 font-medium text-sm">
                      {plan.planType.replace("1:1 Mentorship - ", "").replace(" Plan", "")}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-300 text-xs">{viewMode === "users" ? "Users" : "Revenue"}</div>
                    <div className="font-semibold text-white">
                      {viewMode === "users" ? plan.count : `₹${plan.revenue.toLocaleString()}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">{plan.count} users</span>
                    <span className="text-green-400">₹{plan.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }}></div>
                    <span className="text-slate-300">{plan.displayPercentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-700/50">
          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 text-sm">Total Premium Users</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{data.totalUsers}</p>
          </div>
          <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-green-400">₹{data.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
