"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Users, UserCheck, Crown, Activity } from "lucide-react"

const COLORS = {
  active: "#10b981", // green
  inactive: "#ef4444", // red
  premium: "#f59e0b", // amber
  free: "#6b7280", // gray
}

export default function EngagementOverviewCharts() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/analytics/students/engagement-overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        throw new Error("Failed to fetch engagement data")
      }
    } catch (error) {
      console.error("Error fetching engagement data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50"
          >
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-slate-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-700/50">
        Error loading engagement data: {error}
      </div>
    )
  }

  const activityData = [
    { name: "Active Users", value: data.active, color: COLORS.active },
    { name: "Inactive Users", value: data.inactive, color: COLORS.inactive },
  ]

  const subscriptionData = [
    { name: "Premium Users", value: data.premium, color: COLORS.premium },
    { name: "Free Users", value: data.free, color: COLORS.free },
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-lg">
          <p className="text-slate-200 font-medium">{data.name}</p>
          <p className="text-slate-300">
            Count: <span className="font-semibold text-white">{data.value}</span>
          </p>
          <p className="text-slate-300">
            Percentage:{" "}
            <span className="font-semibold text-white">
              {Math.round(
                (data.value /
                  (data.name.includes("Active")
                    ? data.value + activityData.find((d) => d.name !== data.name)?.value
                    : data.value + subscriptionData.find((d) => d.name !== data.name)?.value)) *
                  100,
              )}
              %
            </span>
          </p>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Activity Chart */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            User Engagement
            <span className="ml-auto text-sm font-normal text-slate-400">Last 30 Days</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "#e2e8f0" }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-400" />
                <span className="text-green-300 text-sm">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{data.active}</p>
              <p className="text-green-300 text-xs">{data.activePercentage}% of total</p>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-red-400" />
                <span className="text-red-300 text-sm">Inactive</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{data.inactive}</p>
              <p className="text-red-300 text-xs">{100 - data.activePercentage}% of total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status Chart */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            Subscription Status
            <span className="ml-auto text-sm font-normal text-slate-400">Current Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "#e2e8f0" }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="text-amber-300 text-sm">Premium</span>
              </div>
              <p className="text-2xl font-bold text-amber-400">{data.premium}</p>
              <p className="text-amber-300 text-xs">{data.premiumPercentage}% of total</p>
            </div>
            <div className="bg-slate-500/10 p-3 rounded-lg border border-slate-500/20">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300 text-sm">Free</span>
              </div>
              <p className="text-2xl font-bold text-slate-400">{data.free}</p>
              <p className="text-slate-300 text-xs">{100 - data.premiumPercentage}% of total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
